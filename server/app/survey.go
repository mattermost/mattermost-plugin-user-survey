// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"fmt"
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/pkg/errors"
)

func (app *UserSurveyApp) SaveSurvey(survey *model.Survey) error {
	survey.SetDefaults()
	if err := survey.IsValid(); err != nil {
		return errors.Wrap(err, "SaveSurvey: survey is not valid")
	}

	return app.store.SaveSurvey(survey)
}

func (app *UserSurveyApp) GetInProgressSurvey() (*model.Survey, error) {
	surveys, err := app.store.GetSurveysByStatus(model.SurveyStatusInProgress)
	if err != nil {
		return nil, errors.Wrap(err, "GetInProgressSurvey: failed to get in progress surveys from database")
	}

	if len(surveys) > 1 {
		return nil, fmt.Errorf("more than one in-progress survey found in the database. There should only be one in-progress survey, in_progress_survey_count: %d", len(surveys))
	}

	if len(surveys) == 0 {
		return nil, nil
	}

	return surveys[0], nil
}

func (app *UserSurveyApp) StopSurvey(surveyID string) error {
	err := app.store.UpdateSurveyStatus(surveyID, model.SurveyStatusEnded)
	if err != nil {
		return errors.Wrap(err, "StopSurvey: failed to stop survey")
	}

	return nil
}
