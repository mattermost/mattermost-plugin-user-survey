// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost/server/public/plugin"

	"github.com/mattermost/mattermost-plugin-user-survey/server/app"
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
	root.HandleFunc("/handleConnected", api.handleConnected).Methods(http.MethodGet)
}

func (api *Handlers) handlePing(w http.ResponseWriter, r *http.Request) {
	_, _ = fmt.Fprint(w, "Pong")
}
