// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package main

import (
	"database/sql"
	"net/http"
	"sync"

	"github.com/mattermost/mattermost/server/public/pluginapi/cluster"

	"github.com/mattermost/mattermost-plugin-user-survey/server/api"
	"github.com/mattermost/mattermost-plugin-user-survey/server/model"

	"github.com/mattermost/mattermost/server/public/pluginapi"

	"github.com/mattermost/mattermost-plugin-user-survey/server/app"
	"github.com/mattermost/mattermost-plugin-user-survey/server/store"

	"github.com/mattermost/mattermost/server/public/plugin"
)

var DebugBuild = "false"

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *model.Config

	store       store.Store
	app         *app.UserSurveyApp
	apiHandlers *api.Handlers

	jobs []*cluster.Job
}

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	p.apiHandlers.Router.ServeHTTP(w, r)
}

func (p *Plugin) OnActivate() error {
	buildMode := "Production"
	if DebugBuild == "true" {
		buildMode = "DEBUG"
	}
	p.API.LogInfo("Starting up User Survey Plugin, build mode: " + buildMode)

	sqlStore, err := p.initStore()
	if err != nil {
		return err
	}

	debugBuild := DebugBuild == "true"
	app, err := p.initApp(sqlStore, debugBuild)
	if err != nil {
		return err
	}

	api := p.initAPI(app)

	p.store = sqlStore
	p.app = app
	p.apiHandlers = api

	if err := p.startManageSurveyJob(); err != nil {
		return err
	}

	if err := p.clearStaleLocks(); err != nil {
		return err
	}

	if DebugBuild == "true" {
		if err := p.registerDebugCommands(); err != nil {
			return err
		}
	}

	return nil
}

func (p *Plugin) OnDeactivate() error {
	err := p.store.Shutdown()
	if err != nil {
		p.API.LogError("failed to close database connection on plugin deactivation.", "error", err.Error())
		return err
	}

	return nil
}

func (p *Plugin) initStore() (store.Store, error) {
	storeParams, err := p.createStoreParams()
	if err != nil {
		return nil, err
	}

	return store.New(*storeParams)
}

func (p *Plugin) createStoreParams() (*store.Params, error) {
	mmConfig := p.API.GetUnsanitizedConfig()
	db, err := p.getMasterDB()
	if err != nil {
		return nil, err
	}

	return &store.Params{
		DBType:                  *mmConfig.SqlSettings.DriverName,
		ConnectionString:        *mmConfig.SqlSettings.DataSource,
		TablePrefix:             store.TablePrefix,
		SkipMigrations:          false,
		PluginAPI:               p.API,
		DB:                      db,
		Driver:                  p.Driver,
		MigrationTimeoutSeconds: *mmConfig.SqlSettings.MigrationsStatementTimeoutSeconds,
	}, nil
}

func (p *Plugin) getMasterDB() (*sql.DB, error) {
	client := pluginapi.NewClient(p.API, p.Driver)
	db, err := client.Store.GetMasterDB()
	if err != nil {
		p.API.LogError("failed to get master DB", "error", err.Error())
		return nil, err
	}

	return db, nil
}

func (p *Plugin) initApp(store store.Store, debugBuild bool) (*app.UserSurveyApp, error) {
	getConfigFunc := func() *model.Config {
		return p.getConfiguration()
	}

	return app.New(p.API, store, getConfigFunc, p.Driver, debugBuild)
}

func (p *Plugin) initAPI(app *app.UserSurveyApp) *api.Handlers {
	return api.New(app, p.API)
}
