// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/pkg/errors"
)

func (app *UserSurveyApp) HandleMattermostConfigChange() error {
	app.api.LogInfo("HandleMattermostConfigChange called")
	draftSurvey, err := app.store.GetDraftSurvey()
	if err != nil {
		app.api.LogInfo("AAA")
		return errors.Wrap(err, "HandleMattermostConfigChange failed to get draft survey")
	}

	if draftSurvey == nil {

	}

	config, err := app.getPluginConfig()
	if err != nil {
		return err
	}

	app.api.LogInfo("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")
	app.api.LogInfo(config.SurveyQuestions[0].Text)
	app.api.LogInfo("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")

	return nil
}

func (app *UserSurveyApp) getPluginConfig() (*model.Config, error) {
	type tempConfig struct {
		SystemConsoleSettings *model.Config `json:"systemconsolesetting"`
	}

	var cfg = new(tempConfig)

	if err := app.api.LoadPluginConfiguration(cfg); err != nil {
		return nil, errors.Wrap(err, "failed to load plugin configuration")
	}

	return cfg.SystemConsoleSettings, nil
}
