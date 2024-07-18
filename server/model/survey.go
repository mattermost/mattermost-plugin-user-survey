// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"slices"
	"time"

	mmModel "github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
)

const (
	SurveyStatusInProgress = "in_progress"
	SurveyStatusEnded      = "ended"

	QuestionTypeLinearScale = "linear_scale"
	QuestionType            = "text"

	TeamFilterSendToAll = "everyone"
	TeamFilterIncludeSelected = "include_selected"
	TeamFilterExcludeSelected = "exclude_selected"
)

var (
	SurveyStatuses = []string{SurveyStatusInProgress, SurveyStatusEnded}
)

type Survey struct {
	ID              string          `json:"id"`
	FilterTeamIDs   []string        `json:"excludedTeamIDs"`
	TeamFilterType  string          `json:"teamFilterType"`
	CreateAt        int64           `json:"createAt"`
	UpdateAt        int64           `json:"updateAt"`
	StartTime       int64           `json:"startTime"`
	Duration        int             `json:"duration"`
	SurveyQuestions SurveyQuestions `json:"surveyQuestions"`
	Status          string          `json:"status"`
}

func (s *Survey) SetDefaults() {
	now := mmModel.GetMillis()

	if s.ID == "" {
		s.ID = utils.NewID()
	}

	if s.CreateAt == 0 {
		s.CreateAt = now
	}

	if s.UpdateAt == 0 {
		s.UpdateAt = now
	}
}

func (s *Survey) IsValid() error {
	if s.ID == "" {
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

	endTime := s.GetEndTime()
	utcDateTime := time.Now().UTC()
	return utcDateTime.After(endTime) || utcDateTime.Equal(endTime)
}

func (s *Survey) GetSystemRatingQuestionID() (string, error) {
	var questionID string
	for _, question := range s.SurveyQuestions.Questions {
		if question.System && question.Type == QuestionTypeLinearScale {
			questionID = question.ID
			break
		}
	}

	if questionID == "" {
		return "", errors.New("no system rating question found")
	}

	return questionID, nil
}

func (s *Survey) GetEndTime() time.Time {
	return time.Unix(0, s.StartTime*int64(time.Millisecond)).
		Add(time.Duration(s.Duration) * 24 * time.Hour)
}

func (s *Survey) IsEqual(survey *Survey) bool {
	if survey == nil || s == nil {
		return false
	}

	if s.StartTime != survey.StartTime {
		return false
	}

	if s.Duration != survey.Duration {
		return false
	}

	if s.SurveyQuestions.SurveyMessageText != survey.SurveyQuestions.SurveyMessageText {
		return false
	}

	if s.TeamFilterType != survey.TeamFilterType {
		return false
	}

	if !slices.Equal(s.FilterTeamIDs, survey.FilterTeamIDs) {
		return false
	}

	questionsEqual := slices.EqualFunc(s.SurveyQuestions.Questions, survey.SurveyQuestions.Questions, func(a, b Question) bool {
		return a.Text == b.Text && a.Type == b.Type && a.System == b.System
	})

	return questionsEqual
}

type Question struct {
	ID        string `json:"id"`
	Text      string `json:"text"`
	Type      string `json:"type"`
	System    bool   `json:"system"`
	Mandatory bool   `json:"mandatory"`
}
