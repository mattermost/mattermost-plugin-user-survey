// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

func (a *UserSurveyApp) HandleMattermostConfigChange() error {
	//app.api.LogInfo("HandleMattermostConfigChange called")
	//draftSurvey, err := app.store.GetInProgressSurvey()
	//if err != nil {
	//	return errors.Wrap(err, "HandleMattermostConfigChange failed to get draft survey")
	//}
	//
	//if draftSurvey == nil {
	//	app.pl
	//}
	//
	return nil
}

func (a *UserSurveyApp) getPluginConfig() *model.Config {
	return a.getConfig()
}
