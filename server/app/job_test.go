// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"testing"
	"time"

	mmModal "github.com/mattermost/mattermost/server/public/model"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

func TestJobManageSurveyStatus(t *testing.T) {
	t.Run("base case - no in progress survey, no new survey to start", func(t *testing.T) {
		th := SetupAppTest(t)

		th.MockedStore.On("GetSurveysByStatus", "in_progress").Return(nil, nil)

		th.App.getConfig = func() *model.Config {
			return &model.Config{
				SurveyDateTime: model.SurveyDateTime{
					Timestamp: 32503680244, // 02/01/3000 15:04
				},
			}
		}

		err := th.App.JobManageSurveyStatus()
		require.NoError(t, err)

		th.MockedStore.AssertExpectations(t)
		th.MockedStore.AssertNotCalled(t, "UpdateSurveyStatus", mock.Anything, "ended")
		th.MockedStore.AssertNotCalled(t, "SaveSurvey", mock.Anything)
	})

	t.Run("in progress survey in database but it doesn't end yet", func(t *testing.T) {
		th := SetupAppTest(t)

		inProgressSurvey := &model.Survey{
			Duration:  10,
			StartTime: mmModal.GetMillis(),
		}

		th.MockedStore.On("GetSurveysByStatus", "in_progress").Return([]*model.Survey{inProgressSurvey}, nil)

		err := th.App.JobManageSurveyStatus()
		require.NoError(t, err)

		th.MockedStore.AssertExpectations(t)
		th.MockedStore.AssertNotCalled(t, "UpdateSurveyStatus", mock.Anything, "ended")
		th.MockedStore.AssertNotCalled(t, "SaveSurvey", mock.Anything)
	})

	t.Run("in progress survey in database that should stop now, but new survey doesn't start yet", func(t *testing.T) {
		th := SetupAppTest(t)

		tenDaysAgo := time.Now().Add(-10 * 24 * time.Hour).UnixMilli()
		inProgressSurvey := &model.Survey{
			ID:        "survey_1",
			Duration:  5,
			StartTime: tenDaysAgo,
		}

		th.MockedStore.On("GetSurveysByStatus", "in_progress").Return([]*model.Survey{inProgressSurvey}, nil)
		th.MockedStore.On("UpdateSurveyStatus", "survey_1", "ended").Return(nil)

		th.App.getConfig = func() *model.Config {
			return &model.Config{
				SurveyDateTime: model.SurveyDateTime{
					Timestamp: 32503680244, // 02/01/3000 15:04
				},
			}
		}

		err := th.App.JobManageSurveyStatus()
		require.NoError(t, err)

		th.MockedStore.AssertExpectations(t)
		th.MockedStore.AssertNotCalled(t, "SaveSurvey", mock.Anything)
	})

	t.Run("in progress survey in database that should stop now and a new survey can be started", func(t *testing.T) {
		th := SetupAppTest(t)

		tenDaysAgo := time.Now().Add(-10 * 24 * time.Hour).UnixMilli()
		inProgressSurvey := &model.Survey{
			ID:        "survey_1",
			Duration:  5,
			StartTime: tenDaysAgo,
		}

		th.MockedStore.On("GetSurveysByStatus", "in_progress").Return([]*model.Survey{inProgressSurvey}, nil)
		th.MockedStore.On("UpdateSurveyStatus", "survey_1", "ended").Return(nil)
		th.MockedStore.On("SaveSurvey", mock.Anything).Return(nil)
		th.MockedStore.On("GetLatestEndedSurvey").Return(nil, nil)

		th.App.getConfig = func() *model.Config {
			return &model.Config{
				SurveyExpiry: model.SurveyExpiry{
					Days: 10,
				},
				SurveyDateTime: model.SurveyDateTime{
					Timestamp: 1138792800, // 02/01/2006 15:04
				},
				SurveyQuestions: model.SurveyQuestions{
					Questions: []model.Question{
						{
							ID:        "question_1",
							Text:      "Foo",
							Type:      "text",
							System:    false,
							Mandatory: false,
						},
					},
				},
			}
		}

		th.MockedPluginAPI.On("SavePluginConfig", mock.Anything).Return(nil)

		err := th.App.JobManageSurveyStatus()
		require.NoError(t, err)

		th.MockedStore.AssertExpectations(t)
	})
}
