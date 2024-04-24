// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"fmt"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

func (a *UserSurveyApp) SaveSurvey(survey *model.Survey) error {
	survey.SetDefaults()
	if err := survey.IsValid(); err != nil {
		return errors.Wrap(err, "SaveSurvey: survey is not valid")
	}

	return a.store.SaveSurvey(survey)
}

func (a *UserSurveyApp) GetInProgressSurvey() (*model.Survey, error) {
	surveys, err := a.store.GetSurveysByStatus(model.SurveyStatusInProgress)
	if err != nil {
		return nil, errors.Wrap(err, "GetInProgressSurvey: failed to get in progress surveys from database")
	}

	if len(surveys) > 1 {
		var surveyIDs string
		for _, survey := range surveys {
			surveyIDs += " " + survey.ID
		}

		return nil, fmt.Errorf("more than one in-progress survey found in the database. There should only be one in-progress survey, in_progress_survey_count: %d, surveyIDs: %s", len(surveys), surveyIDs)
	}

	if len(surveys) == 0 {
		return nil, nil
	}

	return surveys[0], nil
}

func (a *UserSurveyApp) StopSurvey(surveyID string) error {
	err := a.store.UpdateSurveyStatus(surveyID, model.SurveyStatusEnded)
	if err != nil {
		return errors.Wrap(err, "StopSurvey: failed to stop survey")
	}

	return nil
}
