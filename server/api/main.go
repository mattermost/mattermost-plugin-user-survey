// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost/server/public/plugin"

	"github.com/mattermost/mattermost-plugin-user-survey/server/app"
)

const (
	headerMattermostUserID = "Mattermost-User-ID"

	// TODO - potential improvement - use Mattermost's configured payload
	//  size limit if available, else this value default
	maxPayloadSizeBytes = 300000 // 300 Kb
)

type Handlers struct {
	app       *app.UserSurveyApp
	pluginAPI plugin.API
	Router    *mux.Router
}

func New(app *app.UserSurveyApp, pluginAPI plugin.API) *Handlers {
	api := &Handlers{
		app:       app,
		pluginAPI: pluginAPI,
	}

	api.initRoutes()
	return api
}

func (api *Handlers) initRoutes() {
	api.Router = mux.NewRouter()
	root := api.Router.PathPrefix("/api/v1").Subrouter()

	root.HandleFunc("/ping", api.handlePing).Methods(http.MethodGet)
	root.HandleFunc("/connected", api.handleConnected).Methods(http.MethodPost)
	root.HandleFunc("/survey/{surveyID:[a-z0-9]{26}}/response", api.handleSubmitSurveyResponse).Methods(http.MethodPost)
	root.HandleFunc("/survey/{surveyID:[a-z0-9]{26}}/end", api.handleStopSurvey).Methods(http.MethodPost)
	root.HandleFunc("/survey/{surveyID:[a-z0-9]{26}}/report", api.handleGenerateSurveyReport).Methods(http.MethodGet)
	root.HandleFunc("/survey_stats", api.handleGetSurveyStats).Methods(http.MethodGet)
	root.HandleFunc("/survey_post/{postID:[A-Za-z0-9]{26}}/refresh", api.handleRefreshPost).Methods(http.MethodPost)
}

func (api *Handlers) handlePing(w http.ResponseWriter, r *http.Request) {
	_, _ = fmt.Fprint(w, "Pong")
}

func ReturnStatusOK(w http.ResponseWriter) {
	jsonResponse(w, http.StatusOK, map[string]string{"status": "OK"})
}

func jsonResponse(w http.ResponseWriter, code int, data any) {
	bytes, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "error marshaling data", http.StatusInternalServerError)
		return
	}

	setResponseHeader(w, "Content-Type", "application/json")
	w.WriteHeader(code)
	_, _ = w.Write(bytes)
}

func setResponseHeader(w http.ResponseWriter, key string, value string) { //nolint:unparam
	w.Header().Set(key, value)
}
