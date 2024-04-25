// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package utils

import "fmt"

func KeyUserSurveySentStatus(userID, surveyID string) string {
	return fmt.Sprintf("user_survey_status_%s_%s", userID, surveyID)
}

func KeyUserTeamMembershipFilterCache(userID, surveyID string) string {
	return fmt.Sprintf("user_team_filter_cache_%s_%s", userID, surveyID)
}
