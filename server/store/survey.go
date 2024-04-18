// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package store

import (
	"database/sql"
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	sq "github.com/mattermost/squirrel"
	"github.com/pkg/errors"
)

func (s *SQLStore) GetDraftSurvey() (*model.Survey, error) {
	rows, err := s.getQueryBuilder().
		Select(s.surveyColumns()...).
		From(s.tablePrefix + "survey").
		Where(sq.Eq{"status": model.SurveyStatusDraft}).
		Limit(1).
		Query()

	if err != nil {
		return nil, errors.Wrap(err, "SQLStore.GetDraftSurvey failed to fetch draft survey from database")
	}

	surveys, err := s.SurveysFromRows(rows)
	if err != nil {
		return nil, err
	}

	if len(surveys) == 0 {
		return nil, nil
	} else {
		return surveys[0], nil
	}
}

func (s *SQLStore) SurveysFromRows(rows *sql.Rows) ([]*model.Survey, error) {
	surveys := []*model.Survey{}

	for rows.Next() {
		var survey model.Survey
		var questionJSON string

		err := rows.Scan(&survey.Id, &survey.ExcludedTeamIDs, &survey.CreateAt, &survey.UpdateAt, &survey.StartTime, &survey.Duration, &questionJSON, &survey.Status)

		if err != nil {
			return nil, errors.Wrap(err, "SurveysFromRows failed to scan survey row")
		}

		surveys = append(surveys, &survey)
	}

	return surveys, nil
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
