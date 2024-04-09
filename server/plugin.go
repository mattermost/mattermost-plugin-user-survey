package main

import (
	"database/sql"
	"fmt"
	"net/http"
	"sync"

	"github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"

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
	configuration *configuration

	store *store.SQLStore

	app *app.UserSurveyApp
}

func (p *Plugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello, world!")
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

	p.store = sqlStore
	p.app = app

	botID, err := p.API.EnsureBotUser(&model.Bot{
		Username:    "dwight.schrute",
		DisplayName: "Dwight Schrute",
		Description: "Bears, beets, battlestar galactica",
	})

	if err != nil {
		p.API.LogError(err.Error())
		return err
	}

	dm, appErr := p.API.GetDirectChannel(botID, "npeb4h6nejgitesg3ah931ubry")
	if appErr != nil {
		p.API.LogError(appErr.Error())
		return errors.New(appErr.Error())
	}

	props := make(model.StringInterface)
	props["surveyID"] = "survey_id_1"

	post := &model.Post{
		UserId:    botID,
		Type:      "custom_user_survey",
		Message:   ":wave: Hey @sysadmin! Please take a few moments to help us improve your experience with Mattermost.",
		ChannelId: dm.Id,
	}
	post.SetProps(props)

	_, appErr = p.API.CreatePost(post)
	if appErr != nil {
		p.API.LogError(appErr.Error())
		return errors.New(appErr.Error())
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
	return app.New(sqlStore)
}
