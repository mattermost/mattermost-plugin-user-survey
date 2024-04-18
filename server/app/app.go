package app

import (
	"github.com/mattermost/mattermost-plugin-user-survey/server/store"
	"github.com/mattermost/mattermost/server/public/plugin"
)

type UserSurveyApp struct {
	api   plugin.API
	store *store.SQLStore
}

func New(api plugin.API, store *store.SQLStore) (*UserSurveyApp, error) {
	return &UserSurveyApp{
		api:   api,
		store: store,
	}, nil
}
