// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"encoding/json"
	"fmt"
	"github.com/mattermost/mattermost-plugin-user-survey/server/assets"
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
	mmModal "github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/pluginapi"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

const (
	surveyPostType = "custom_user_survey"
)

func (a *UserSurveyApp) SaveSurvey(survey *model.Survey) error {
	survey.SetDefaults()
	if err := survey.IsValid(); err != nil {
		return errors.Wrap(err, "SaveSurvey: survey is not valid")
	}

	return a.store.SaveSurvey(survey)
}

func (a *UserSurveyApp) GetInProgressSurvey() (*model.Survey, error) {
	surveys, err := a.store.GetSurveysByStatus(model.SurveyStatusInProgress)
	if err != nil {
		return nil, errors.Wrap(err, "GetInProgressSurvey: failed to get in progress surveys from database")
	}

	if len(surveys) > 1 {
		var surveyIDs string
		for _, survey := range surveys {
			surveyIDs += " " + survey.ID
		}

		return nil, fmt.Errorf("more than one in-progress survey found in the database. There should only be one in-progress survey, in_progress_survey_count: %d, surveyIDs: %s", len(surveys), surveyIDs)
	}

	if len(surveys) == 0 {
		return nil, nil
	}

	return surveys[0], nil
}

func (a *UserSurveyApp) StopSurvey(surveyID string) error {
	err := a.store.UpdateSurveyStatus(surveyID, model.SurveyStatusEnded)
	if err != nil {
		return errors.Wrap(err, "StopSurvey: failed to stop survey")
	}

	return nil
}

func (a *UserSurveyApp) SurveySentToUser(userID, surveyID string) (bool, error) {
	data, err := a.api.KVGet(utils.KeyUserSurveySentStatus(userID, surveyID))
	if err != nil {
		a.api.LogError("Failed to get user survey sent status key from KV store", "userID", userID, "surveyID", surveyID, "error", err.Error())
		return false, errors.Wrap(err, "SurveySentToUser: Failed to get user survey sent status key from KV store")
	}

	if data == nil {
		return false, nil
	}

	return string(data) == "survey_sent", nil
}

func (a *UserSurveyApp) SendUserSurvey(userID string, survey *model.Survey) error {
	if err := a.ensureSurveyBot(); err != nil {
		return err
	}

	user, appErr := a.api.GetUser(userID)
	if appErr != nil {
		a.api.LogError("SendUserSurvey: failed to get user from ID", "userID", user, "error", appErr.Error())
		return errors.Wrap(appErr, "SendUserSurvey: failed to get user from ID: "+userID)
	}

	// open a DB between the bot and the user
	botUserDM, appErr := a.api.GetDirectChannel(user.Id, a.botID)
	if appErr != nil {
		errMsg := fmt.Sprintf("SendUserSurvey: failed to create DM between survey bot and user, botID: %s, userID: %s, error: %w", a.botID, userID, appErr.Error())
		a.api.LogError(errMsg)
		return errors.Wrap(errors.New(appErr.Error()), errMsg)
	}

	postMessage := fmt.Sprintf(":wave: Hey @%s! %s", user.Username, survey.SurveyQuestions.SurveyMessageText)

	post := &mmModal.Post{
		UserId:    a.botID,
		Message:   postMessage,
		ChannelId: botUserDM.Id,
		Type:      surveyPostType,
	}

	questionsJSON, err := json.Marshal(survey.SurveyQuestions)
	if err != nil {
		a.api.LogError("SendUserSurvey: failed to marshal survey questions for inserting into post", "error", err.Error())
		return errors.Wrap(err, "SendUserSurvey: failed to marshal survey questions for inserting into post")
	}

	post.AddProp("survey_questions", questionsJSON)

	_, appErr = a.api.CreatePost(post)
	if appErr != nil {
		a.api.LogError("SendUserSurvey: failed to create survey post for user", "userID", userID, "error", appErr.Error())
		return errors.Wrap(appErr, "SendUserSurvey: failed to create survey post for user")
	}

	return nil
}

func (a *UserSurveyApp) ensureSurveyBot() error {
	if a.botID != "" {
		return nil
	}

	bot := &mmModal.Bot{
		Username:    "feedbackbot",
		DisplayName: "Feedbackbot",
		Description: "Created by User Survey plugin",
	}

	botID, err := a.apiClient.Bot.EnsureBot(bot, pluginapi.ProfileImageBytes(assets.BotIcon))
	if err != nil {
		a.api.LogError("failed to ensure feedback bot", "error", err.Error())
		return errors.Wrap(err, "ensureSurveyBot: failed to ensure feedback bot")
	}

	a.botID = botID
	return nil
}
