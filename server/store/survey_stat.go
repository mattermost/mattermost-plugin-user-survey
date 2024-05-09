// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package store

import (
	"database/sql"
	"encoding/json"
	"fmt"
	sq "github.com/mattermost/squirrel"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

func (s *SQLStore) GetSurveyStatList() ([]*model.SurveyStat, error) {
	rows, err := s.getQueryBuilder().
		Select(s.surveyStatColumns()...).
		From(s.tablePrefix + "survey").
		OrderBy("start_time DESC, status DESC").
		Query()

	if err != nil {
		s.pluginAPI.LogError("GetSurveyStatList: failed to query survey stats from database", "error", err.Error())
		return nil, errors.Wrap(err, "GetSurveyStatList: failed to query survey stats from database")
	}

	surveyStats, err := s.surveyStatsFromRows(rows)
	if err != nil {
		return nil, err
	}

	return surveyStats, nil
}

func (s *SQLStore) GetSurveyStat(surveyID string) (*model.SurveyStat, error) {
	rows, err := s.getQueryBuilder().
		Select(s.surveyStatColumns()...).
		From(s.tablePrefix + "survey").
		Where(sq.Eq{"id": surveyID}).
		Query()

	if err != nil {
		s.pluginAPI.LogError("GetSurveyStat: failed to query survey stats from database", "error", err.Error())
		return nil, errors.Wrap(err, "GetSurveyStat: failed to query survey stats from database")
	}

	surveyStats, err := s.surveyStatsFromRows(rows)
	if err != nil {
		return nil, err
	}

	if len(surveyStats) == 0 {
		return nil, nil
	} else if len(surveyStats) > 1 {
		return nil, fmt.Errorf("more than one survey survey stat found for the given surveyID: %s", surveyID)
	}

	return surveyStats[0], nil
}

func (s *SQLStore) surveyStatColumns() []string {
	surveyStateColumns := []string{
		"receipt_count",
		"response_count",
		"passives_count",
		"promoters_count",
		"detractors_count",
	}

	return append(s.surveyColumns(), surveyStateColumns...)
}

func (s *SQLStore) surveyStatsFromRows(rows *sql.Rows) ([]*model.SurveyStat, error) {
	surveyStats := []*model.SurveyStat{}

	for rows.Next() {
		var surveyStat model.SurveyStat
		var excludedTeamIDsJSON string
		var questionsJSON string

		err := rows.Scan(
			&surveyStat.ID,
			&excludedTeamIDsJSON,
			&surveyStat.CreateAt,
			&surveyStat.UpdateAt,
			&surveyStat.StartTime,
			&surveyStat.Duration,
			&questionsJSON,
			&surveyStat.Status,
			&surveyStat.ReceiptCount,
			&surveyStat.ResponseCount,
			&surveyStat.PassiveCount,
			&surveyStat.PromoterCount,
			&surveyStat.DetractorCount,
		)
		if err != nil {
			s.pluginAPI.LogError("surveyStatsFromRows: failed to scan survey stat row", "error", err.Error())
			return nil, errors.Wrap(err, "surveyStatsFromRows failed to scan survey stat row")
		}

		err = json.Unmarshal([]byte(excludedTeamIDsJSON), &surveyStat.ExcludedTeamIDs)
		if err != nil {
			s.pluginAPI.LogError("surveyStatsFromRows: failed to unmarshal excluded team IDs string to survey", "error", err.Error())
			return nil, errors.Wrap(err, "surveyStatsFromRows: failed to unmarshal excluded team IDs string to survey")
		}

		err = json.Unmarshal([]byte(questionsJSON), &surveyStat.SurveyQuestions)
		if err != nil {
			s.pluginAPI.LogError("surveyStatsFromRows: failed to unmarshal survey questions string to survey", "error", err.Error())
			return nil, errors.Wrap(err, "surveyStatsFromRows: failed to unmarshal survey questions string to survey")
		}

		surveyStats = append(surveyStats, &surveyStat)
	}

	return surveyStats, nil
}
