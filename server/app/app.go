package app

import (
	"github.com/mattermost/mattermost/server/public/plugin"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/mattermost/mattermost-plugin-user-survey/server/store"
)

type UserSurveyApp struct {
	api       plugin.API
	store     store.Store
	getConfig func() *model.Config
}

func New(api plugin.API, store store.Store, getConfigFunc func() *model.Config) (*UserSurveyApp, error) {
	return &UserSurveyApp{
		api:       api,
		store:     store,
		getConfig: getConfigFunc,
	}, nil
}
