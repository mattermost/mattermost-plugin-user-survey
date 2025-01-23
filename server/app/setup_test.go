// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
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

type AppTestHelper struct {
	App             *UserSurveyApp
	MockedStore     *mocks.Store
	MockedPluginAPI *plugintest.API
}

func SetupAppTest(t *testing.T) *AppTestHelper {
	mockedAPI := &plugintest.API{}
	testutils.MockLogs(mockedAPI)
	testutils.MockSetupBot(mockedAPI)

	mockedStore := mocks.Store{}
	mockedDriver := plugintest.Driver{}

	getConfig := func() *model.Config {
		return &model.Config{}
	}

	app, err := New(mockedAPI, &mockedStore, getConfig, &mockedDriver, true)
	require.NoError(t, err)

	return &AppTestHelper{
		App:             app,
		MockedStore:     &mockedStore,
		MockedPluginAPI: mockedAPI,
	}
}
