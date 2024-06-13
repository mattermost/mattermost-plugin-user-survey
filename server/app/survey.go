// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"encoding/json"
	"fmt"
	"time"

	mmModal "github.com/mattermost/mattermost/server/public/model"
	"github.com/mattermost/mattermost/server/public/pluginapi"
	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/assets"
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

const (
	surveyPostType  = "custom_user_survey"
	surveySentValue = "survey_sent"

	cacheValidityUserTeamFilter = 7200 // 2 hours in seconds
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

func (a *UserSurveyApp) AcquireUserSurveyLock(key string, utcNow time.Time) (bool, error) {
	value, err := json.Marshal(utcNow)
	if err != nil {
		a.api.LogError("AcquireUserSurveyLock: failed to marshal time value", "value", utcNow.String())
		return false, errors.Wrap(err, "AcquireUserSurveyLock: failed to marshal time value")
	}

	locked, err := a.TryLock(key, value)
	if err != nil {
		a.api.LogError("AcquireUserSurveyLock: failed to acquire user survey lock", "key", key, "value", value, "error", err.Error())
		return false, errors.Wrap(err, "AcquireUserSurveyLock: failed to acquire user survey lock")
	}

	return locked, nil
}

func (a *UserSurveyApp) ReleaseUserSurveyLock(key string, utcNow time.Time) (bool, error) {
	value, err := json.Marshal(utcNow)
	if err != nil {
		a.api.LogError("ReleaseUserSurveyLock: failed to marshal time value", "value", utcNow.String())
		return false, errors.Wrap(err, "ReleaseUserSurveyLock: failed to marshal time value")
	}

	unlocked, err := a.Unlock(key, value)
	if err != nil {
		a.api.LogError("ReleaseUserSurveyLock: failed to unlock user survey lock", "key", key, "value", value, "error", err.Error())
		return false, errors.Wrap(err, "ReleaseUserSurveyLock: failed to unlock user survey lock")
	}

	return unlocked, err
}

func (a *UserSurveyApp) ShouldSendSurvey(userID string, survey *model.Survey) (bool, error) {
	if survey.Status != model.SurveyStatusInProgress {
		return false, errors.New("ShouldSendSurvey: a survey can only be sent against an in progress survey")
	}

	postID, err := a.GetSurveyPostIDSentToUser(userID, survey.ID)
	if err != nil {
		return false, errors.Wrap(err, "ShouldSendSurvey: failed to check if survey is already sent to the user")
	}

	if postID != "" {
		return false, nil
	}

	inExcludedTeam, err := a.userInExcludedTeams(userID, survey)
	if err != nil {
		return false, errors.Wrap(err, "ShouldSendSurvey: failed to check is in filtered teams or not")
	}

	return !inExcludedTeam, nil
}

func (a *UserSurveyApp) GetSurveyPostIDSentToUser(userID, surveyID string) (string, error) {
	postID, appErr := a.api.KVGet(utils.KeyUserSurveySentStatus(userID, surveyID))
	if appErr != nil {
		a.api.LogError("GetSurveySentToUser: Failed to get user survey sent status key from KV store", "userID", userID, "surveyID", surveyID, "error", appErr.Error())
		return "", errors.Wrap(appErr, "GetSurveySentToUser: Failed to get user survey sent status key from KV store")
	}

	if postID == nil {
		return "", nil
	}

	return string(postID), nil
}

func (a *UserSurveyApp) setSurveySentToUser(userID, surveyID, postID string) error {
	appErr := a.api.KVSet(utils.KeyUserSurveySentStatus(userID, surveyID), []byte(postID))
	if appErr != nil {
		a.api.LogError("setSurveySentToUser: Failed to set user survey sent status in KV store", "userID", userID, "surveyID", surveyID, "error", appErr.Error())
		return errors.Wrap(appErr, "setSurveySentToUser: Failed to set user survey sent status in KV store")
	}

	return nil
}

func (a *UserSurveyApp) SendSurvey(userID string, survey *model.Survey) error {
	user, appErr := a.api.GetUser(userID)
	if appErr != nil {
		a.api.LogError("SendSurvey: failed to get user from ID", "userID", user, "error", appErr.Error())
		return errors.Wrap(appErr, "SendSurvey: failed to get user from ID: "+userID)
	}

	// open a DM between the bot and the user
	botUserDM, appErr := a.api.GetDirectChannel(user.Id, a.botID)
	if appErr != nil {
		errMsg := fmt.Sprintf("SendSurvey: failed to create DM between survey bot and user, botID: %s, userID: %s, error: %s", a.botID, userID, appErr.Error())
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
		a.api.LogError("SendSurvey: failed to marshal survey questions for inserting into post", "error", err.Error())
		return errors.Wrap(err, "SendSurvey: failed to marshal survey questions for inserting into post")
	}

	post.AddProp(postPropKeySurveyQuestions, string(questionsJSON))
	post.AddProp(postPropSurveyID, survey.ID)

	createdPost, appErr := a.api.CreatePost(post)
	if appErr != nil {
		a.api.LogError("SendSurvey: failed to create survey post for user", "userID", userID, "error", appErr.Error())
		return errors.Wrap(appErr, "SendSurvey: failed to create survey post for user")
	}

	if err := a.setSurveySentToUser(userID, survey.ID, createdPost.Id); err != nil {
		return errors.Wrap(err, "SendSurvey: failed to mark survey set to user")
	}

	if err := a.store.IncrementSurveyReceiptCount(survey.ID); err != nil {
		return errors.Wrap(err, "SendSurvey: failed to increment survey receipt count")
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

func (a *UserSurveyApp) userInExcludedTeams(userID string, survey *model.Survey) (bool, error) {
	// no need to check for memberships if
	// no teams were excluded from the survey
	if len(survey.ExcludedTeamIDs) == 0 {
		return false, nil
	}

	// check in cache first
	result, ok, err := a.getCachedUserNotInFilteredTeams(userID, survey.ID)
	if err != nil {
		return false, err
	}

	if ok {
		// if there was a cache hit, just return the cached result
		return result, nil
	}

	// compute data on cache miss
	teams, appErr := a.api.GetTeamsForUser(userID)
	if appErr != nil {
		a.api.LogError("userInExcludedTeams: failed to get user teams", "userID", userID, "error", appErr.Error())
		return false, errors.Wrap(errors.New(appErr.Error()), "userInExcludedTeams: failed to get user teams")
	}

	filteredTeamMap := map[string]bool{}
	for _, teamID := range survey.ExcludedTeamIDs {
		filteredTeamMap[teamID] = true
	}

	userMemberOfFilteredTeam := false

	for _, team := range teams {
		if _, ok := filteredTeamMap[team.Id]; ok {
			userMemberOfFilteredTeam = true
			break
		}
	}

	// don't break if unable to save in cache.
	// The function logs the error so we're fine.
	_ = a.setCacheUserNotInFilteredTeams(userID, survey.ID, userMemberOfFilteredTeam)
	return userMemberOfFilteredTeam, nil
}

func (a *UserSurveyApp) getCachedUserNotInFilteredTeams(userID, surveyID string) (result bool, ok bool, err error) {
	key := utils.KeyUserTeamMembershipFilterCache(userID, surveyID)
	item, appErr := a.api.KVGet(key)
	if appErr != nil {
		a.api.LogError("getCachedUserNotInFilteredTeams: failed to get cache for user team filter criteria", "error", appErr.Error())
		return false, false, errors.New("getCachedUserNotInFilteredTeams: failed to get cache for user team filter criteria, error: " + appErr.Error())
	}

	if item == nil {
		return false, false, nil
	}

	return string(item) == "true", true, nil
}

func (a *UserSurveyApp) setCacheUserNotInFilteredTeams(userID, surveyID string, meetsCriteria bool) error {
	key := utils.KeyUserTeamMembershipFilterCache(userID, surveyID)
	appErr := a.api.KVSetWithExpiry(key, []byte(fmt.Sprintf("%t", meetsCriteria)), cacheValidityUserTeamFilter)
	if appErr != nil {
		a.api.LogError("setCacheUserNotInFilteredTeams: failed to set cache for user team filter criteria", "error", appErr.Error())
		return errors.New("setCacheUserNotInFilteredTeams: failed to set cache for user team filter criteria, error: " + appErr.Error())
	}

	return nil
}
