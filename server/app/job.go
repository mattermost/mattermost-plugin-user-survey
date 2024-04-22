// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
	mmModal "github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"
)

func (a *UserSurveyApp) JobStartSurvey() {
	a.api.LogDebug("JobStartSurvey: running, fetching in progress survey")

	// first check if there is a running survey in the database
	inProgressSurvey, err := a.GetInProgressSurvey()
	if err != nil {
		a.api.LogError("JobStartSurvey: failed to get in progress survey from database", "error", err.Error())
		return
	}

	var checkForNewSurvey bool

	if inProgressSurvey == nil {
		// if there is no active survey in database,
		// do check for new survey
		a.api.LogDebug("JobStartSurvey: no in progress survey found in the database")
		checkForNewSurvey = true
	} else if inProgressSurvey.ShouldSurveyStop() {
		// if the survey ends now, do check for new survey
		a.api.LogDebug("JobStartSurvey: in progress survey exists in database but it ended")
		checkForNewSurvey = true
		// stop the survey here
	} else {
		// if the survey hasn't ended, don't check for new survey
		a.api.LogDebug("JobStartSurvey: in progress survey exists in database and is still running")
		checkForNewSurvey = false
	}

	if checkForNewSurvey {
		a.api.LogDebug("JobStartSurvey: checking if a new survey can start now")
		if err := a.startNewSurveyIfNeeded(); err != nil {
			a.api.LogError("JobStartSurvey: failed to start ne survey if needed", "error", err.Error())
			return
		}
	}
}

func (a *UserSurveyApp) startNewSurveyIfNeeded() error {
	config := a.getConfig()
	shouldStartSurvey, err := config.ShouldSurveyStart()
	if err != nil {
		return errors.Wrap(err, "startNewSurveyIfNeeded: failed to check if survey should be started")
	}

	if shouldStartSurvey {
		now := mmModal.GetMillis()
		startTime, err := config.ParsedTime()
		if err != nil {
			return errors.Wrap(err, "startNewSurveyIfNeeded: failed to read survey parsed time")
		}

		survey := &model.Survey{
			Id:              utils.NewID(),
			ExcludedTeamIDs: config.TeamFilter.FilteredTeamIDs,
			CreateAt:        now,
			UpdateAt:        now,
			StartTime:       startTime.UnixMilli(),
			Duration:        config.SurveyExpiry.Days,
			SurveyQuestions: config.SurveyQuestions,
			Status:          model.SurveyStatusInProgress,
		}

		err = a.SaveSurvey(survey)
		if err != nil {
			return errors.Wrap(err, "startNewSurveyIfNeeded: failed to save survey in database")
		}
	}

	return nil
}
