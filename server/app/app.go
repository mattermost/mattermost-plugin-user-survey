package app

import (
	"github.com/mattermost/mattermost-plugin-user-survey/server/store"
)

type UserSurveyApp struct {
	store *store.SQLStore
}

func New(store *store.SQLStore) (*UserSurveyApp, error) {
	return &UserSurveyApp{
		store: store,
	}, nil
}
