// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"github.com/gorilla/mux"
	"net/http"
)

func (api *Handlers) handleGetSurveyStats(w http.ResponseWriter, r *http.Request) {
	if err := api.RequireAuthentication(w, r); err != nil {
		return
	}

	if err := api.RequireSystemAdmin(w, r); err != nil {
		return
	}

	surveyStats, err := api.app.GetSurveyStatList()
	if err != nil {
		api.pluginAPI.LogError("handleGetSurveyStats: failed to get survey stats", "error", err.Error())
		http.Error(w, "Failed to get survey stats", http.StatusInternalServerError)
		return
	}

	jsonResponse(w, http.StatusOK, surveyStats)
}

func (api *Handlers) handleGenerateSurveyReport(w http.ResponseWriter, r *http.Request) {
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

	api.app.GenerateSurveyReport(surveyID)

	ReturnStatusOK(w)
}
