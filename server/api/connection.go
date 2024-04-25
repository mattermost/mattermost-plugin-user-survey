// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"net/http"
)

func (api *Handlers) handleConnected(w http.ResponseWriter, r *http.Request) {
	// check if there is an in progress survey, if so,
	// check if the user has already been sent to the user, if not,
	// check if the user is eligible for receiving the survey, if so,
	// send the survey.

	inProgressSurvey, err := api.app.GetInProgressSurvey()
	if err != nil {
		http.Error(w, "Failed to fetch survey details", http.StatusInternalServerError)
		return
	}

	// no in progress survey exists
	if inProgressSurvey == nil {
		ReturnStatusOK(w)
		return
	}

	userID := r.Header.Get(headerMattermostUserID)
	alreadySent, err := api.app.SurveySentToUser(userID, inProgressSurvey.ID)
	if err != nil {
		http.Error(w, "Failed to check survey status", http.StatusInternalServerError)
		return
	}

	if alreadySent {
		ReturnStatusOK(w)
		return
	}

	if err := api.app.SendUserSurvey(userID, inProgressSurvey); err != nil {
		http.Error(w, "Failed to send survey", http.StatusInternalServerError)
		return
	}

	ReturnStatusOK(w)
}
