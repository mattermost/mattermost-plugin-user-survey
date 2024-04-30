// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"encoding/json"

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
		if err := a.store.SaveSurveyResponse(response); err != nil {
			return errors.Wrap(err, "SaveSurveyResponse: failed to save response to database")
		}
	} else {
		if existingResponse.ResponseType == model.ResponseTypePartial {
			response.ID = existingResponse.ID
			if err := a.store.UpdateSurveyResponse(response); err != nil {
				return errors.Wrap(err, "SaveSurveyResponse: failed to update existing partial survey response")
			}
		} else if existingResponse.ResponseType == model.ResponseTypeComplete {
			return nil
		}
	}

	return a.addResponseInPost(response)
}

func (a *UserSurveyApp) addResponseInPost(response *model.SurveyResponse) error {
	postID, err := a.getSurveySentToUser(response.UserID, response.SurveyID)
	if err != nil {
		return errors.Wrap(err, "addResponseInPost: failed to fetch KV store entry for user survey")
	}

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
