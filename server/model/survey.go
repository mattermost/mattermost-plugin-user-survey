// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
	mmModel "github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"
	"time"
)

const (
	SurveyStatusDraft      = "draft"
	SurveyStatusInProgress = "in_progress"

	QuestionTypeLinearScale = "linear_scale"
	QuestionType            = "text"
)

var (
	SurveyStatuses = []string{SurveyStatusDraft, SurveyStatusInProgress}
)

type Survey struct {
	Id              string          `json:"id"`
	ExcludedTeamIDs []string        `json:"excludedTeamIDs"`
	CreateAt        int64           `json:"createAt"`
	UpdateAt        int64           `json:"updateAt"`
	StartTime       int64           `json:"startTime"`
	Duration        int             `json:"duration"`
	SurveyQuestions SurveyQuestions `json:"surveyQuestions"`
	Status          string          `json:"status"`
}

func (s *Survey) SetDefaults() {
	now := mmModel.GetMillis()

	if s.Id == "" {
		s.Id = utils.NewID()
	}

	if s.CreateAt == 0 {
		s.CreateAt = now
	}

	if s.UpdateAt == 0 {
		s.UpdateAt = now
	}
}

func (s *Survey) IsValid() error {
	if s.Id == "" {
		return errors.New("survey ID cannot be empty")
	}

	if s.CreateAt == 0 {
		return errors.New("create at time cannot be empty")
	}

	if s.UpdateAt == 0 {
		return errors.New("update at time cannot be empty")
	}

	if s.Duration <= 0 {
		return errors.New("duration cannot be empty")
	}

	if len(s.SurveyQuestions.Questions) == 0 {
		return errors.New("survey cannot have empty questions")
	}

	if s.Status == "" {
		return errors.New("survey status cannot be empty")
	}

	return nil
}

func (s *Survey) ShouldSurveyStop() bool {
	if s.Duration == 0 {
		return false
	}

	endTime := time.Unix(0, s.StartTime*int64(time.Millisecond)).
		Add(time.Duration(s.Duration) * 24 * time.Hour)

	utcDateTime := time.Now().UTC()

	return utcDateTime.After(endTime) || utcDateTime.Equal(endTime)

}

type Question struct {
	Id        string `json:"id"`
	Text      string `json:"text"`
	Type      string `json:"type"`
	System    bool   `json:"system"`
	Mandatory bool   `json:"mandatory"`
}
