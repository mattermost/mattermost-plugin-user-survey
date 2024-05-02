// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
	"net/http"
	"time"
)

func (api *Handlers) handleConnected(w http.ResponseWriter, r *http.Request) {
	if err := api.RequireAuthentication(w, r); err != nil {
		return
	}

	if err := api.DisallowGuestUsers(w, r); err != nil {
		return
	}

	// check if there is an in progress survey, if so,
	// check if the user has already been sent to the user, if not,
	// check if the user is eligible for receiving the survey, if so,
	// send the survey.

	userID := r.Header.Get(headerMattermostUserID)

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

	should, err := api.app.ShouldSendSurvey(userID, inProgressSurvey)
	if err != nil {
		http.Error(w, "Failed to check survey status", http.StatusInternalServerError)
		return
	}

	if !should {
		ReturnStatusOK(w)
		return
	}

	key := utils.KeyUserSendSurveyLock(userID)
	utcNow := time.Now().UTC()
	locked, err := api.app.AcquireUserSurveyLock(key, utcNow)
	if err != nil {
		http.Error(w, "Failed to acquire lock", http.StatusInternalServerError)
		return
	}

	if !locked {
		ReturnStatusOK(w)
		return
	}

	defer func() {
		_, _ = api.app.ReleaseUserSurveyLock(key, utcNow)
	}()

	if err := api.app.SendSurvey(userID, inProgressSurvey); err != nil {
		http.Error(w, "Failed to send survey", http.StatusInternalServerError)
		return
	}

	ReturnStatusOK(w)
}
