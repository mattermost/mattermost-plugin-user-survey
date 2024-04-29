// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/pkg/errors"
)

func (a *UserSurveyApp) SaveSurveyResponse(response *model.SurveyResponse) error {
	response.SetDefaults()
	if err := response.IsValid(); err != nil {
		a.api.LogDebug("SaveSurveyResponse: survey is invalid", "error", err.Error())
		return errors.Wrap(err,"SaveSurveyResponse: survey response is invalid")
	}

	existingResponse, err := a.store.GetSurveyResponse(response.UserID, response.SurveyId)
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
		}
	}

	return nil
}
