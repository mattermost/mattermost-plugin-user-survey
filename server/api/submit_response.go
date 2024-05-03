// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

func (api *Handlers) handleSubmitSurveyResponse(w http.ResponseWriter, r *http.Request) {
	if err := api.RequireAuthentication(w, r); err != nil {
		return
	}

	if err := api.DisallowGuestUsers(w, r); err != nil {
		return
	}

	userID := r.Header.Get(headerMattermostUserID)
	vars := mux.Vars(r)
	surveyID, ok := vars["surveyID"]
	if !ok {
		http.Error(w, "missing survey ID in request", http.StatusBadRequest)
		return
	}

	body := http.MaxBytesReader(w, r.Body, maxPayloadSizeBytes)
	var response *model.SurveyResponse
	if err := json.NewDecoder(body).Decode(&response); err != nil {
		api.pluginAPI.LogError("handleSubmitSurveyResponse: failed to unmarshal request body", "error", err.Error())
		http.Error(w, "failed to read request body", http.StatusInternalServerError)
		return
	}

	response.SurveyID = surveyID
	response.UserID = userID

	// now that we have response, we'll verify that the response matches
	// what is expected in the active survey. For example,
	// the number of questions and answers should match, and the submission should
	// only be against the active survey

	if err := api.app.SaveSurveyResponse(response); err != nil {
		api.pluginAPI.LogError("handleSubmitSurveyResponse: failed to save survey response", "error", err.Error())
		http.Error(w, "failed to save response", http.StatusInternalServerError)
		return
	}

	ReturnStatusOK(w)
}
