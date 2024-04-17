// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"errors"
	"github.com/mattermost/mattermost-plugin-user-survey/server/app"
	"github.com/mattermost/mattermost/server/public/plugin"
)

type APIParams struct {
	App       *app.UserSurveyApp
	PluginAPI plugin.API
}

func (params APIParams) IsValid() error {
	if params.App == nil {
		return errors.New("params.App cannot be nil")
	}

	if params.PluginAPI == nil {
		return errors.New("params.PluginAPI cannot be nil")
	}

	return nil
}
