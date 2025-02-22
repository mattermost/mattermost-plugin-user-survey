// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package store

import (
	"database/sql"
	"text/template"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

type Store interface {
	Shutdown() error
	Migrate(migrationTimeoutSeconds int) error
	GetTemplateHelperFuncs() template.FuncMap
	GetSchemaName() (string, error)
	GetSurveysByStatus(status string) ([]*model.Survey, error)
	GetSurveysByID(surveyID string) (*model.Survey, error)
	SurveysFromRows(rows *sql.Rows) ([]*model.Survey, error)
	SaveSurvey(survey *model.Survey) error
	UpdateSurveyStatus(surveyID, status string) error
	SaveSurveyResponse(response *model.SurveyResponse) error
	GetSurveyResponse(userID, surveyID string) (*model.SurveyResponse, error)
	UpdateSurveyResponse(response *model.SurveyResponse) error
	IncrementSurveyReceiptCount(surveyID string) error
	IncrementSurveyResponseCount(surveyID string) error
	GetSurveyStatList() ([]*model.SurveyStat, error)
	GetSurveyStat(surveyID string) (*model.SurveyStat, error)
	UpdateRatingGroupCount(surveyID string, promoterFactor, neutralFactor, detractorFactor int) error
	ResetData() error
	GetAllResponses(surveyID, lastResponseID string, perPage uint64) ([]*model.SurveyResponse, error)
	GetLatestEndedSurvey() (*model.Survey, error)
}
