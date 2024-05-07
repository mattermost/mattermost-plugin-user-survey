// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package store

import "github.com/pkg/errors"

func (s *SQLStore) ResetData() error {
	s.pluginAPI.LogWarn("Resetting all survey data...")

	_, err := s.getQueryBuilder().
		Delete(s.tablePrefix + "survey").
		Exec()

	if err != nil {
		s.pluginAPI.LogError("SQLStore.resetData: failed to reset data from survey table", "error", err.Error())
		return errors.Wrap(err, "SQLStore.resetData: failed to reset data from survey table")
	}

	_, err = s.getQueryBuilder().
		Delete(s.tablePrefix + "survey_responses").
		Exec()

	if err != nil {
		s.pluginAPI.LogError("SQLStore.resetData: failed to reset data from survey_responses table", "error", err.Error())
		return errors.Wrap(err, "SQLStore.resetData: failed to reset data from survey_responses table")
	}

	appErr := s.pluginAPI.KVDeleteAll()
	if appErr != nil {
		s.pluginAPI.LogError("SQLStore.resetData: failed to delete all KV store entries", "error", appErr.Error())
		return errors.Wrap(errors.New(appErr.Error()), "SQLStore.resetData: failed to delete all KV store entries")
	}

	return nil
}
