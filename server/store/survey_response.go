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

func (s *SQLStore) SaveSurveyResponse(response *model.SurveyResponse) error {
	questionResponseJSON, err := s.MarshalJSONB(response.Response)
	if err != nil {
		s.pluginAPI.LogError("SaveSurveyResponse: failed to marshal response map", "error", err.Error())
		return errors.Wrap(err, "SaveSurveyResponse: failed to marshal response map")
	}

	_, err = s.getQueryBuilder().
		Insert(s.tablePrefix+"survey_responses").
		Columns(s.surveyResponseColumns()...).
		Values(
			response.ID,
			response.UserID,
			response.SurveyID,
			questionResponseJSON,
			response.CreateAt,
			response.ResponseType,
		).Exec()

	if err != nil {
		s.pluginAPI.LogError("SaveSurveyResponse: failed to save survey response in database", "error", err.Error())
		return errors.Wrap(err, "SaveSurveyResponse: failed to save survey response in database")
	}

	return nil
}

func (s *SQLStore) UpdateSurveyResponse(response *model.SurveyResponse) error {
	questionResponseJSON, err := s.MarshalJSONB(response.Response)
	if err != nil {
		s.pluginAPI.LogError("UpdateSurveyResponse: failed to marshal response map", "error", err.Error())
		return errors.Wrap(err, "UpdateSurveyResponse: failed to marshal response map")
	}

	_, err = s.getQueryBuilder().
		Update(s.tablePrefix+"survey_responses").
		Set("response", questionResponseJSON).
		Set("create_at", response.CreateAt).
		Set("response_type", response.ResponseType).
		Where(sq.Eq{
			"id":            response.ID,
			"response_type": model.ResponseTypePartial,
		}).Exec()

	if err != nil {
		s.pluginAPI.LogError("UpdateSurveyResponse: failed to update survey response in database", "response_id", response.ID, "error", err.Error())
		return errors.Wrap(err, "UpdateSurveyResponse: failed to update survey response in database")
	}

	return nil
}

func (s *SQLStore) GetSurveyResponse(userID, surveyID string) (*model.SurveyResponse, error) {
	rows, err := s.getQueryBuilder().
		Select(s.surveyResponseColumns()...).
		From(s.tablePrefix + "survey_responses").
		Where(sq.Eq{
			"survey_id": surveyID,
			"user_id":   userID,
		}).Query()

	if err != nil {
		s.pluginAPI.LogError("GetSurveyResponse: failed to query survey response from database", "userID", userID, "surveyID", surveyID, "error", err.Error())
		return nil, errors.Wrap(err, "GetSurveyResponse: failed to query survey response from database")
	}

	responses, err := s.surveyResponsesFromRows(rows)
	if err != nil {
		return nil, errors.Wrap(err, "GetSurveyResponse: failed to get survey responses from rows")
	}

	if len(responses) == 0 {
		return nil, nil
	}

	if len(responses) > 1 {
		return nil, fmt.Errorf("GetSurveyResponse: more than one survey responses found for user-survey combination, userID: %s, surveyID: %s, count: %d", userID, surveyID, len(responses))
	}

	return responses[0], nil
}

func (s *SQLStore) surveyResponseColumns() []string {
	return []string{
		"id",
		"user_id",
		"survey_id",
		"response",
		"create_at",
		"response_type",
	}
}

func (s *SQLStore) surveyResponsesFromRows(rows *sql.Rows) ([]*model.SurveyResponse, error) {
	var surveyResponses []*model.SurveyResponse

	for rows.Next() {
		var surveyResponse model.SurveyResponse
		var responseString string

		err := rows.Scan(
			&surveyResponse.ID,
			&surveyResponse.UserID,
			&surveyResponse.SurveyID,
			&responseString,
			&surveyResponse.CreateAt,
			&surveyResponse.ResponseType,
		)

		if err != nil {
			s.pluginAPI.LogError("surveyResponsesFromRows: failed to scan row", "error", err.Error())
			return nil, errors.Wrap(err, "surveyResponsesFromRows: failed to scan row")
		}

		err = json.Unmarshal([]byte(responseString), &surveyResponse.Response)
		if err != nil {
			s.pluginAPI.LogError("surveyResponsesFromRows: failed to unmarshal response string", "error", err.Error())
			return nil, errors.Wrap(err, "surveyResponsesFromRows: failed to unmarshal response string")
		}

		surveyResponses = append(surveyResponses, &surveyResponse)
	}

	return surveyResponses, nil
}

func (s *SQLStore) GetAllResponses(surveyID, lastResponseID string, perPage uint64) ([]*model.SurveyResponse, error) {
	// TODO: add index on id and survey_id column

	query := s.getQueryBuilder().
		Select(s.surveyResponseColumns()...).
		From(s.tablePrefix + "survey_responses").
		Where(sq.Eq{"survey_id": surveyID}).
		OrderBy("id").
		Limit(perPage)

	if lastResponseID != "" {
		query = query.Where(sq.Gt{"id": lastResponseID})
	}

	rows, err := query.Query()
	if err != nil {
		s.pluginAPI.LogError("GetAllResponses: failed to query a page", "surveyID", surveyID, "lastResponseID", lastResponseID, "perPage", perPage, "error", err.Error())
		return nil, errors.Wrap(err, "GetAllResponses: failed to query a page")
	}

	surveyResponses, err := s.surveyResponsesFromRows(rows)
	if err != nil {
		return nil, errors.Wrap(err, "GetAllResponses: failed to convert rows to survey responses")
	}

	return surveyResponses, nil
}
