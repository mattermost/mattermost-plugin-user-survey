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

	survey, err := api.app.GetInProgressSurvey()
	if err != nil {
		api.pluginAPI.LogError("handleSubmitSurveyResponse: failed to fetch in progress survey", "error", err.Error())
		http.Error(w, "failed to fetch survey", http.StatusInternalServerError)
		return
	}

	// the response should belong to the currently active survey
	if survey == nil || survey.ID != surveyID {
		err = api.app.UpdatePostForExpiredSurvey(userID, response.SurveyID)
		if err != nil {
			http.Error(w, "failed to update post for expired survey", http.StatusInternalServerError)
			return
		}

		return
	}

	if err := api.app.SaveSurveyResponse(response); err != nil {
		api.pluginAPI.LogError("handleSubmitSurveyResponse: failed to save survey response", "error", err.Error())
		http.Error(w, "failed to save response", http.StatusInternalServerError)
		return
	}

	ReturnStatusOK(w)
}

func (api *Handlers) handleRefreshPost(w http.ResponseWriter, r *http.Request) {
	if err := api.RequireAuthentication(w, r); err != nil {
		return
	}

	if err := api.DisallowGuestUsers(w, r); err != nil {
		return
	}

	userID := r.Header.Get(headerMattermostUserID)

	vars := mux.Vars(r)
	postID, ok := vars["postID"]
	if !ok {
		http.Error(w, "missing post ID in request", http.StatusBadRequest)
		return
	}

	err := api.app.HandleRefreshSurveyPost(userID, postID)
	if err != nil {
		http.Error(w, "failed to check post for expired survey", http.StatusInternalServerError)
		return
	}

	ReturnStatusOK(w)
}
