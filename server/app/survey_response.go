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

const (
	postPropKeySurveyResponse   = "survey_response"
	postPropKeyResponseCreateAt = "survey_response_create_at"
	postPropKeySurveyStatus     = "survey_status"
	postPropKeySurveyQuestions  = "survey_questions"
	postPropSurveyID            = "survey_id"
	postPropSurveyExpiryDate    = "survey_expire_at"

	postPropValueSurveyStatusSubmitted = "submitted"
	postPropValueSurveyStatusExpired   = "ended"
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

	post.AddProp(postPropKeySurveyResponse, string(responseJSON))

	if response.ResponseType == model.ResponseTypeComplete {
		post.AddProp(postPropKeyResponseCreateAt, response.CreateAt)
		post.AddProp(postPropKeySurveyStatus, postPropValueSurveyStatusSubmitted)
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

func (a *UserSurveyApp) UpdatePostForExpiredSurvey(userID, surveyID string) error {
	postID, err := a.getSurveySentToUser(userID, surveyID)
	if err != nil || postID == "" {
		a.api.LogError("UpdatePostForExpiredSurvey: failed to fetch KV store entry for user survey", "userID", userID, "surveyID", surveyID, "error", err.Error())
		return errors.Wrap(err, fmt.Sprintf("UpdatePostForExpiredSurvey: failed to fetch KV store entry for user survey, userID: %s, surveyID: %s", userID, surveyID))
	}

	expiredSurvey, err := a.store.GetSurveysByID(surveyID)
	if err != nil {
		return errors.Wrap(err, "UpdatePostForExpiredSurvey: failed to fetch expired survey from database, surveyID: "+surveyID)
	}

	post, appErr := a.api.GetPost(postID)
	if appErr != nil {
		a.api.LogError("UpdatePostForExpiredSurvey: failed to get post from ID", "userID", userID, "surveyID", surveyID, "error", appErr.Error())
		return errors.Wrap(errors.New(appErr.Error()), "UpdatePostForExpiredSurvey: failed to get post from ID")
	}

	post.AddProp(postPropKeySurveyStatus, postPropValueSurveyStatusExpired)
	post.AddProp(postPropSurveyExpiryDate, expiredSurvey.GetEndTime().Format("02 January 2006"))

	_, appErr = a.api.UpdatePost(post)
	if appErr != nil {
		a.api.LogError("UpdatePostForExpiredSurvey: failed to update post after updating it for expired survey", "userID", userID, "surveyID", surveyID, "error", appErr.Error())
		return errors.Wrap(errors.New(appErr.Error()), fmt.Sprintf("UpdatePostForExpiredSurvey: failed to update post after updating it for expired survey, userID: %s, surveyID: %s", userID, surveyID))
	}

	return nil
}
