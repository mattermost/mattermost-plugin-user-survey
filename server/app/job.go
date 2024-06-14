// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	mmModal "github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
)

// JobManageSurveyStatus is a scheduled job that ends a running survey if needed,
// and starts a new survey if needed.
func (a *UserSurveyApp) JobManageSurveyStatus() error {
	a.api.LogDebug("JobManageSurveyStatus: running, fetching in progress survey")

	// first check if there is an in progress survey in the database
	inProgressSurvey, err := a.GetInProgressSurvey()
	if err != nil {
		a.api.LogError("JobManageSurveyStatus: failed to get in progress survey from database", "error", err.Error())
		return err
	}

	var checkForNewSurvey bool

	if inProgressSurvey == nil {
		// if there is no in progress survey in database,
		// do check for new survey
		a.api.LogDebug("JobManageSurveyStatus: no in progress survey found in the database")
		checkForNewSurvey = true
	} else {
		if inProgressSurvey.ShouldSurveyStop() {
			// if the survey ends now, do check for new survey
			a.api.LogDebug("JobManageSurveyStatus: in progress survey exists in database but it ended")
			checkForNewSurvey = true

			if err := a.StopSurvey(inProgressSurvey.ID); err != nil {
				a.api.LogError("JobManageSurveyStatus: failed to stop survey", "error", err.Error())
				return err
			}
		} else {
			// if the survey hasn't ended, don't check for new survey
			a.api.LogDebug("JobManageSurveyStatus: in progress survey exists in database and is still running")
			checkForNewSurvey = false
		}
	}

	if checkForNewSurvey {
		a.api.LogDebug("JobManageSurveyStatus: checking if a new survey can start now")
		if err := a.startNewSurveyIfNeeded(); err != nil {
			a.api.LogError("JobManageSurveyStatus: failed to start new survey if needed", "error", err.Error())
			return err
		}
	}

	return nil
}

func (a *UserSurveyApp) startNewSurveyIfNeeded() error {
	a.api.LogDebug("JobManageSurveyStatus: checking if new survey should start")
	config := a.getConfig()
	shouldStartSurvey, err := config.ShouldSurveyStart()
	if err != nil {
		return errors.Wrap(err, "JobManageSurveyStatus: failed to check if survey should be started")
	}

	if shouldStartSurvey {
		// compare with latest ended survey if it's not the same as the survey we're trying to start.
		// When an admin ends a survey manually within its duration, not checking this can result
		// in the job starting a duplicate survey immoderately. So, compare the config with last ended survey
		// and only start a new survey if they both are different.
		endedSurvey, err := a.store.GetLatestEndedSurvey()
		if err != nil {
			return errors.Wrap(err, "startNewSurveyIfNeeded: failed to get latest ended survey from database")
		}

		a.api.LogDebug("JobManageSurveyStatus: determined that the new survey should start")
		now := mmModal.GetMillis()
		startTime, err := config.ParsedTime()
		if err != nil {
			return errors.Wrap(err, "JobManageSurveyStatus: failed to read survey parsed time")
		}

		surveyFromConfig := &model.Survey{
			ID:              utils.NewID(),
			ExcludedTeamIDs: config.TeamFilter.FilteredTeamIDs,
			CreateAt:        now,
			UpdateAt:        now,
			StartTime:       startTime.UnixMilli(),
			Duration:        config.SurveyExpiry.Days,
			SurveyQuestions: model.SurveyQuestions{SurveyMessageText: config.SurveyQuestions.SurveyMessageText},
			Status:          model.SurveyStatusInProgress,
		}

		for _, question := range config.SurveyQuestions.Questions {
			if question.Text != "" {
				surveyFromConfig.SurveyQuestions.Questions = append(surveyFromConfig.SurveyQuestions.Questions, question)
			}
		}

		if surveyFromConfig.IsEqual(endedSurvey) {
			a.api.LogDebug("JobManageSurveyStatus: not starting new survey as it is the same as latest ended survey")
			return nil
		}

		a.api.LogDebug("JobManageSurveyStatus: saving new survey")
		err = a.SaveSurvey(surveyFromConfig)
		if err != nil {
			return errors.Wrap(err, "JobManageSurveyStatus: failed to save survey in database")
		}

		config.SurveyDateTime.Date = ""
		configMap, err := config.ToMap()
		if err != nil {
			a.api.LogError("JobManageSurveyStatus: failed to convert config to map", "error", err.Error())
			// no need to break here as this error isn't critical to the job flow.
		} else {
			if appErr := a.api.SavePluginConfig(configMap); appErr != nil {
				a.api.LogError("JobManageSurveyStatus: failed to save plugin config", "error", appErr.Error())
			}
		}

		a.api.LogDebug("JobManageSurveyStatus: saved new survey")
	} else {
		a.api.LogDebug("JobManageSurveyStatus: determined that the new survey should NOT start")
	}

	return nil
}
