// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost-plugin-user-survey/server/app"
	"github.com/mattermost/mattermost/server/public/plugin"
	"net/http"
)

type APIHandlers struct {
	app       *app.UserSurveyApp
	pluginAPI plugin.API
	Router    *mux.Router
}

func New(app *app.UserSurveyApp, pluginAPI plugin.API) *APIHandlers {
	api := &APIHandlers{
		app:       app,
		pluginAPI: pluginAPI,
	}

	api.initRoutes()
	return api
}

func (api *APIHandlers) initRoutes() {
	api.Router = mux.NewRouter()
	root := api.Router.PathPrefix("/api").Subrouter()

	root.HandleFunc("/connected", api.connected).Methods(http.MethodGet)
}
