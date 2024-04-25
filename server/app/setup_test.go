// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"testing"

	"github.com/mattermost/mattermost/server/public/plugin/plugintest"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
	"github.com/mattermost/mattermost-plugin-user-survey/server/store/mocks"
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils/testutils"
)

func SetupTests(t *testing.T) (*UserSurveyApp, *mocks.Store) {
	mockedAPI := &plugintest.API{}
	testutils.MockLogs(mockedAPI)

	mockedStore := mocks.Store{}
	mockedDriver := plugintest.Driver{}

	getConfig := func() *model.Config {
		return &model.Config{}
	}

	app, err := New(mockedAPI, &mockedStore, getConfig, &mockedDriver)
	require.NoError(t, err)

	return app, &mockedStore
}
