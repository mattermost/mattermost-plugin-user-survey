// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"net/http"
	"time"

	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
)

func (api *Handlers) handleConnected(w http.ResponseWriter, r *http.Request) {
	if err := api.RequireAuthentication(w, r); err != nil {
		return
	}

	if err := api.DisallowGuestUsers(w, r); err != nil {
		return
	}

	// check if there is an in progress survey, if so,
	// check if the survey has already been sent to the user, if not,
	// check if the user is eligible for receiving the survey, if so,
	// send the survey.

	userID := r.Header.Get(headerMattermostUserID)

	// check if there is any in-progress survey
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

	// acquire lock to prevent two API calls from each sending a duplicate survey to the same user
	key := utils.KeyUserSendSurveyLock(userID)
	utcNow := time.Now().UTC()
	locked, err := api.app.AcquireUserSurveyLock(key, utcNow)
	if err != nil {
		http.Error(w, "Failed to acquire lock", http.StatusInternalServerError)
		return
	}

	// if couldn't acquire the lock, and there is no error,
	// it means some other handler is already handling this API for the same user,
	// so we can safely exit here.
	if !locked {
		ReturnStatusOK(w)
		return
	}

	// make sure to release the lock when done.
	defer func() {
		_, _ = api.app.ReleaseUserSurveyLock(key, utcNow)
	}()

	should, err := api.app.ShouldSendSurvey(userID, inProgressSurvey)
	if err != nil {
		http.Error(w, "Failed to check survey status", http.StatusInternalServerError)
		return
	}

	if !should {
		ReturnStatusOK(w)
		return
	}

	if err := api.app.SendSurvey(userID, inProgressSurvey); err != nil {
		http.Error(w, "Failed to send survey", http.StatusInternalServerError)
		return
	}

	ReturnStatusOK(w)
}
