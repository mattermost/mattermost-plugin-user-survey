// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"encoding/json"
	"fmt"

	mmModel "github.com/mattermost/mattermost/server/public/model"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

func (a *UserSurveyApp) SaveSurveyResponse(response *model.SurveyResponse) error {
	response.SetDefaults()
	if err := response.IsValid(); err != nil {
		a.api.LogDebug("SaveSurveyResponse: survey is invalid", "error", err.Error())
		return errors.Wrap(err, "SaveSurveyResponse: survey response is invalid")
	}

	existingResponse, err := a.store.GetSurveyResponse(response.UserID, response.SurveyID)
	if err != nil {
		return errors.Wrap(err, "SaveSurveyResponse: failed to get existing user survey response")
	}

	if existingResponse == nil {
		err = a.store.SaveSurveyResponse(response)
		if err != nil {
			return errors.Wrap(err, "SaveSurveyResponse: failed to save response to database")
		}

		err = a.store.IncrementSurveyResponseCount(response.SurveyID)
		if err != nil {
			return errors.Wrap(err, "SaveSurveyResponse: failed to increment survey response count in database")
		}
	} else {
		if existingResponse.ResponseType == model.ResponseTypePartial {
			response.ID = existingResponse.ID
			err = a.store.UpdateSurveyResponse(response)
			if err != nil {
				return errors.Wrap(err, "SaveSurveyResponse: failed to update existing partial survey response")
			}
		} else if existingResponse.ResponseType == model.ResponseTypeComplete {
			return nil
		}
	}

	postID, err := a.getSurveySentToUser(response.UserID, response.SurveyID)
	if err != nil {
		return errors.Wrap(err, "addResponseInPost: failed to fetch KV store entry for user survey")
	}

	if err := a.addResponseInPost(response, postID); err != nil {
		return errors.Wrap(err, fmt.Sprintf("SaveSurveyResponse: failed to add submitted response in post, userID: %s, surveyID: %s responseType: %s", response.UserID, response.SurveyID, response.ResponseType))
	}

	if response.ResponseType == model.ResponseTypeComplete {
		if err := a.sendAcknowledgementPost(response.UserID, postID); err != nil {
			return errors.Wrap(err, "SaveSurveyResponse: failed to create survey submission ack post")
		}
	}

	return nil
}

func (a *UserSurveyApp) addResponseInPost(response *model.SurveyResponse, postID string) error {
	post, appErr := a.api.GetPost(postID)
	if appErr != nil {
		a.api.LogError("addResponseInPost: failed to get post by ID from plugin API", "postID", postID, "error", appErr.Error())
		return errors.Wrap(errors.New(appErr.Error()), "addResponseInPost: failed to get post by ID from plugin API")
	}

	responseJSON, err := json.Marshal(response.Response)
	if err != nil {
		a.api.LogError("addResponseInPost: failed to marshal survey responses", "error", err.Error())
		return errors.Wrap(err, "addResponseInPost: failed to marshal survey responses")
	}

	post.AddProp("survey_response", string(responseJSON))

	if response.ResponseType == model.ResponseTypeComplete {
		post.AddProp("survey_response_create_at", response.CreateAt)
		post.AddProp("survey_status", "submitted")
	}

	_, appErr = a.api.UpdatePost(post)
	if appErr != nil {
		a.api.LogError("addResponseInPost: failed to update post after adding response props", "postID", postID, "error", appErr.Error())
		return errors.Wrap(errors.New(appErr.Error()), "addResponseInPost: failed to update post after adding response props")
	}

	return nil
}

func (a *UserSurveyApp) sendAcknowledgementPost(userID, surveyPostID string) error {
	if a.botID == "" {
		if err := a.ensureSurveyBot(); err != nil {
			return errors.Wrap(err, "sendAcknowledgementPost: failed to ensure bot")
		}
	}

	botUserDM, appErr := a.api.GetDirectChannel(userID, a.botID)
	if appErr != nil {
		errMsg := fmt.Sprintf("sendAcknowledgementPost: failed to create DM between survey bot and user, botID: %s, userID: %s, error: %s", a.botID, userID, appErr.Error())
		a.api.LogError(errMsg)
		return errors.Wrap(errors.New(appErr.Error()), errMsg)
	}

	post := &mmModel.Post{
		UserId:    a.botID,
		Message:   ":tada: Thank you for helping us make Mattermost better!",
		ChannelId: botUserDM.Id,
		RootId:    surveyPostID,
	}

	if _, appErr := a.api.CreatePost(post); appErr != nil {
		a.api.LogError("sendAcknowledgementPost: failed to send survey submission ack post", "user_id", userID, "channelID", botUserDM, "error", appErr.Error())
		return fmt.Errorf("sendAcknowledgementPost: failed to send survey submission ack post, err: %s", appErr.Error())
	}

	return nil
}
