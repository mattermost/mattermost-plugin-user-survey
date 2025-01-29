// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"net/http"

	"github.com/gorilla/mux"
)

func (api *Handlers) handleStopSurvey(w http.ResponseWriter, r *http.Request) {
	if err := api.RequireAuthentication(w, r); err != nil {
		return
	}

	if err := api.RequireSystemAdmin(w, r); err != nil {
		return
	}

	vars := mux.Vars(r)
	surveyID, ok := vars["surveyID"]
	if !ok {
		http.Error(w, "missing survey ID in request", http.StatusBadRequest)
		return
	}

	// you can only stop an in-progress survey
	inProgressSurvey, err := api.app.GetInProgressSurvey()
	if err != nil {
		http.Error(w, "Failed to get in progress survey", http.StatusInternalServerError)
		return
	}

	// if there is no in progress survey
	if inProgressSurvey == nil {
		http.Error(w, "No running survey found", http.StatusBadRequest)
		return
	}

	if inProgressSurvey.ID != surveyID {
		http.Error(w, "Cannot stop a survey that isn't running", http.StatusBadRequest)
		return
	}

	if err := api.app.StopSurvey(surveyID); err != nil {
		http.Error(w, "failed to stop survey", http.StatusInternalServerError)
		return
	}

	ReturnStatusOK(w)
}
