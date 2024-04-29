// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
	mmModel "github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"
)

const (
	ResponseTypeComplete = "complete"
	ResponseTypePartial  = "partial"
)

type SurveyResponse struct {
	ID           string            `json:"ID"`
	UserID       string            `json:"userID"`
	SurveyID     string            `json:"surveyID"`
	Response     map[string]string `json:"response"` // map of question ID to response
	CreateAt     int64             `json:"createAt"`
	ResponseType string            `json:"responseType"`
}

func (sr *SurveyResponse) SetDefaults() {
	if sr.ID == "" {
		sr.ID = utils.NewID()
	}

	if sr.CreateAt == 0 {
		sr.CreateAt = mmModel.GetMillis()
	}
}

func (sr *SurveyResponse) IsValid() error {
	if sr.ID == "" {
		return errors.New("survey response ID cannot be empty")
	}

	if sr.UserID == "" {
		return errors.New("survey response user ID cannot be empty")
	}

	if sr.SurveyID == "" {
		return errors.New("survey response survey ID cannot be empty")
	}

	if len(sr.Response) == 0 {
		return errors.New("survey response responses cannot be empty")
	}

	if sr.CreateAt == 0 {
		return errors.New("survey response creating time cannot be empty")
	}

	if sr.ResponseType == "" {
		return errors.New("survey response type cannot be empty")
	}

	return nil
}
