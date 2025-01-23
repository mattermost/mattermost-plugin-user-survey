// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"net/http"
	"path/filepath"
	"time"

	"github.com/gorilla/mux"
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

	userID := r.Header.Get(headerMattermostUserID)

	vars := mux.Vars(r)
	surveyID, ok := vars["surveyID"]
	if !ok {
		http.Error(w, "missing survey ID in request", http.StatusBadRequest)
		return
	}

	file, err := api.app.GenerateSurveyReport(userID, surveyID)
	if err != nil {
		http.Error(w, "failed to generate survey report", http.StatusInternalServerError)
		return
	}

	webServerMode := api.pluginAPI.GetConfig().ServiceSettings.WebserverMode
	WriteFileResponse(filepath.Base(file.Name()), "application/zip", 0, time.Now(), *webServerMode, file, true, w, r)
}
