// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package store

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"slices"

	sq "github.com/mattermost/squirrel"
	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

func (s *SQLStore) GetSurveysByStatus(status string) ([]*model.Survey, error) {
	if slices.Index(model.SurveyStatuses, status) == -1 {
		return nil, errors.New("GetSurveysByStatus: unknown status status encountered, status: " + status)
	}

	rows, err := s.getQueryBuilder().
		Select(s.surveyColumns()...).
		From(s.tablePrefix + "survey").
		Where(sq.Eq{"status": status}).
		Query()

	if err != nil {
		return nil, errors.Wrap(err, "SQLStore.GetInProgressSurvey failed to fetch survey by status from database")
	}

	surveys, err := s.SurveysFromRows(rows)
	if err != nil {
		return nil, errors.Wrap(err, "GetSurveysByStatus: failed to map survey rows to surveys")
	}

	return surveys, nil
}

func (s *SQLStore) SurveysFromRows(rows *sql.Rows) ([]*model.Survey, error) {
	surveys := []*model.Survey{}

	for rows.Next() {
		var survey model.Survey
		var excludedTeamIDsJSON string
		var questionsJSON string

		err := rows.Scan(
			&survey.ID,
			&excludedTeamIDsJSON,
			&survey.CreateAt,
			&survey.UpdateAt,
			&survey.StartTime,
			&survey.Duration,
			&questionsJSON,
			&survey.Status,
		)
		if err != nil {
			return nil, errors.Wrap(err, "SurveysFromRows failed to scan survey row")
		}

		err = json.Unmarshal([]byte(excludedTeamIDsJSON), &survey.ExcludedTeamIDs)
		if err != nil {
			return nil, errors.Wrap(err, "SurveysFromRows: failed to unmarshal excluded team IDs string to survey")
		}

		err = json.Unmarshal([]byte(questionsJSON), &survey.SurveyQuestions)
		if err != nil {
			return nil, errors.Wrap(err, "SurveysFromRows: failed to unmarshal survey questions string to survey")
		}

		surveys = append(surveys, &survey)
	}

	return surveys, nil
}

func (s *SQLStore) SaveSurvey(survey *model.Survey) error {
	excludedTeamIDs, surveyQuestions, err := s.surveyExtractJSONFields(survey)
	if err != nil {
		return errors.Wrap(err, "SaveSurvey: failed to extract JSON fields")
	}

	_, err = s.getQueryBuilder().
		Insert(s.tablePrefix+"survey").
		Columns(s.surveyColumns()...).
		Values(
			survey.ID,
			excludedTeamIDs,
			survey.CreateAt,
			survey.UpdateAt,
			survey.StartTime,
			survey.Duration,
			surveyQuestions,
			survey.Status,
		).Exec()

	if err != nil {
		return errors.Wrap(err, "SaveSurvey: failed to save survey in database")
	}

	return nil
}

func (s *SQLStore) UpdateSurveyStatus(surveyID, status string) error {
	_, err := s.getQueryBuilder().
		Update(s.tablePrefix+"survey").
		Set("status", status).
		Where(sq.Eq{"id": surveyID}).Exec()

	if err != nil {
		return errors.Wrap(err, fmt.Sprintf("UpdateSurveyStatus: failed to update survey status in database, surveyID: %s, status: %s", surveyID, status))
	}

	return nil
}

func (s *SQLStore) surveyExtractJSONFields(survey *model.Survey) (excludedTeamIDs, surveyQuestions []byte, err error) {
	excludedTeamIDs, err = json.Marshal(survey.ExcludedTeamIDs)
	if err != nil {
		return nil, nil, errors.Wrap(err, "surveyExtractJSONFields: failed to marshal excluded team IDs")
	}

	surveyQuestions, err = json.Marshal(survey.SurveyQuestions)
	if err != nil {
		return nil, nil, errors.Wrap(err, "surveyExtractJSONFields: failed to marshal survey questions")
	}

	return
}

func (s *SQLStore) surveyColumns() []string {
	return []string{
		"id",
		"excluded_team_ids",
		"create_at",
		"updated_at",
		"start_time",
		"duration",
		"questions",
		"status",
	}
}

func (s *SQLStore) GetSurveysByID(surveyID string) (*model.Survey, error) {
	rows, err := s.getQueryBuilder().
		Select(s.surveyColumns()...).
		From(s.tablePrefix + "survey").
		Where(sq.Eq{"id": surveyID}).
		Query()

	if err != nil {
		return nil, errors.Wrap(err, "GetSurveysByID failed to fetch survey by status from database")
	}

	surveys, err := s.SurveysFromRows(rows)
	if err != nil {
		return nil, errors.Wrap(err, "GetSurveysByID: failed to map survey rows to surveys")
	}

	if len(surveys) > 1 {
		s.pluginAPI.LogError("GetSurveysByID: more than one survey found with the given ID", "surveyID", surveyID)
		return nil, errors.New("GetSurveysByID: more than one survey found with the given ID, surveyID: " + surveyID)
	}

	return surveys[0], nil
}
