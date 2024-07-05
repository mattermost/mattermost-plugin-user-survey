package app

import (
	"github.com/mattermost/mattermost/server/public/plugin"
	"github.com/mattermost/mattermost/server/public/pluginapi"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/mattermost/mattermost-plugin-user-survey/server/store"
)

type UserSurveyApp struct {
	api        plugin.API
	store      store.Store
	getConfig  func() *model.Config
	apiClient  *pluginapi.Client
	botID      string
	debugBuild bool
}

func New(
	api plugin.API,
	store store.Store,
	getConfigFunc func() *model.Config,
	driver plugin.Driver,
	debugBuild bool,
) (*UserSurveyApp, error) {
	app := &UserSurveyApp{
		api:        api,
		store:      store,
		getConfig:  getConfigFunc,
		apiClient:  pluginapi.NewClient(api, driver),
		debugBuild: debugBuild,
	}

	err := app.ensureSurveyBot()
	return app, err
}
