// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import "github.com/mattermost/mattermost-plugin-user-survey/server/model"

func (a *UserSurveyApp) GetSurveyStatList() ([]*model.SurveyStat, error) {
	return a.store.GetSurveyStatList()
}
