// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"fmt"
	"github.com/gorilla/mux"
	"github.com/mattermost/mattermost-plugin-user-survey/server/app"
	"github.com/mattermost/mattermost/server/public/plugin"
	"net/http"
)

type API struct {
	app       *app.UserSurveyApp
	pluginAPI plugin.API
	Router    *mux.Router
}

func New(app *app.UserSurveyApp, pluginAPI plugin.API) *API {
	api := &API{
		app:       app,
		pluginAPI: pluginAPI,
	}

	api.initRoutes()
	return api
}

func (api *API) initRoutes() {
	api.Router = mux.NewRouter()
	root := api.Router.PathPrefix("/api").Subrouter()

	root.HandleFunc("/connected", api.connected).Methods(http.MethodGet)

	api.pluginAPI.LogError("===============================================================")
	api.Router.Walk(func(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {
		tpl, err1 := route.GetPathTemplate()
		met, err2 := route.GetMethods()
		fmt.Println(tpl, err1, met, err2)
		return nil
	})
	api.pluginAPI.LogError("===============================================================")
}
