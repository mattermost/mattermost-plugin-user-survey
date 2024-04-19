// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"fmt"
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
	mmModal "github.com/mattermost/mattermost/server/public/model"
	"time"
)

func (a *UserSurveyApp) JobStartSurvey() {
	//inProgressSurvey, err := a.store.GetInProgressSurvey()
	//if err != nil {
	//	a.api.LogError(fmt.Sprintf("failed to get in progress survey from database, error: %w", err))
	//	return
	//}

	config := a.getConfig()
	shouldStartSurvey, err := config.ShouldSurveyStart()
	if err != nil {
		a.api.LogError(fmt.Sprintf("failed to check if survey should be started, error: %w", err))
		return
	}

	if shouldStartSurvey {
		now := mmModal.GetMillis()
		startTime, err := config.ParsedTime()
		if err != nil {
			a.api.LogError(fmt.Sprintf("failed to read survey parsed time, error: %w", err))
			return
		}

		survey := &model.Survey{
			Id: utils.NewID(),
			ExcludedTeamIDs: config.TeamFilter.FilteredTeamIDs,
			CreateAt: now,
			UpdateAt: now,
			StartTime: startTime.UnixMilli(),
			Duration: config.SurveyExpiry.Days,
			Questions: config.SurveyQuestions
		}
	}
}
