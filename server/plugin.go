package main

import (
	"database/sql"
	"github.com/mattermost/mattermost-plugin-user-survey/server/api"
	"net/http"
	"sync"

	"github.com/mattermost/mattermost/server/public/pluginapi"

	"github.com/mattermost/mattermost-plugin-user-survey/server/app"
	"github.com/mattermost/mattermost-plugin-user-survey/server/store"

	"github.com/mattermost/mattermost/server/public/plugin"
)

// Plugin implements the interface expected by the Mattermost server to communicate between the server and plugin processes.
type Plugin struct {
	plugin.MattermostPlugin

	// configurationLock synchronizes access to the configuration.
	configurationLock sync.RWMutex

	// configuration is the active plugin configuration. Consult getConfiguration and
	// setConfiguration for usage.
	configuration *Configuration

	store       *store.SQLStore
	app         *app.UserSurveyApp
	apiHandlers *api.APIHandlers
}

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	p.API.LogError("EEEEEEE")
	p.apiHandlers.Router.ServeHTTP(w, r)
}

func (p *Plugin) OnActivate() error {
	sqlStore, err := p.initStore()
	if err != nil {
		return err
	}

	app, err := p.initApp(sqlStore)
	if err != nil {
		return err
	}

	api := p.initAPI(app)

	p.store = sqlStore
	p.app = app
	p.apiHandlers = api

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

func (p *Plugin) initStore() (*store.SQLStore, error) {
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
		DBType:           *mmConfig.SqlSettings.DriverName,
		ConnectionString: *mmConfig.SqlSettings.DataSource,
		TablePrefix:      store.TablePrefix,
		SkipMigrations:   false,
		PluginAPI:        p.API,
		DB:               db,
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

func (p *Plugin) initApp(sqlStore *store.SQLStore) (*app.UserSurveyApp, error) {
	return app.New(p.API, sqlStore)
}

func (p *Plugin) initAPI(app *app.UserSurveyApp) *api.APIHandlers {
	return api.New(app, p.API)
}
