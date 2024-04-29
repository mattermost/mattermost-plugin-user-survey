// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package store

import (
	"encoding/json"
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/pkg/errors"
)

func (s *SQLStore) SaveSurveyResponse(response *model.SurveyResponse) error {
	questionResponseJSON, err := json.Marshal(response.Response)
	if err != nil {
		s.pluginAPI.LogError("SaveSurveyResponse: failed to marshal response map", "error", err.Error())
		return errors.Wrap(err, "SaveSurveyResponse: failed to marshal response map")
	}

	query := s.getQueryBuilder().
		Insert(s.tablePrefix+"survey_responses").
		Columns(s.surveyResponseColumns()...).
		Values(
			response.ID,
			response.UserID,
			response.SurveyId,
			string(questionResponseJSON),
			response.CreateAt,
		)

	if s.dbType == model.DBTypeMySQL {
		query = query.Suffix("ON DUPLICATE KEY UPDATE id = id")
	} else {
		query = query.Suffix("ON CONFLICT (user_id, survey_id) DO NOTHING")
	}

	if _, err = query.Exec(); err != nil {
		s.pluginAPI.LogError("SaveSurveyResponse: failed to save survey response in database", "error", err.Error())
		return errors.Wrap(err, "SaveSurveyResponse: failed to save survey response in database")
	}

	return nil
}

func (s *SQLStore) surveyResponseColumns() []string {
	return []string{
		"id",
		"user_id",
		"survey_id",
		"response",
		"create_at",
	}
}
