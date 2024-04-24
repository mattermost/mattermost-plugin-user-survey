package store

import (
	"database/sql"
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"text/template"
)

type Store interface {
	Shutdown() error
	Migrate() error
	GetTemplateHelperFuncs() template.FuncMap
	GetSchemaName() (string, error)
	GetSurveysByStatus(status string) ([]*model.Survey, error)
	SurveysFromRows(rows *sql.Rows) ([]*model.Survey, error)
	SaveSurvey(survey *model.Survey) error
	UpdateSurveyStatus(surveyID, status string) error
}
