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
		app, mockedStore := SetupTests(t)

		mockedStore.On("GetSurveysByStatus", "in_progress").Return(nil, nil)

		err := app.JobManageSurveyStatus()
		require.NoError(t, err)

		mockedStore.AssertExpectations(t)
		mockedStore.AssertNotCalled(t, "UpdateSurveyStatus", mock.Anything, "ended")
		mockedStore.AssertNotCalled(t, "SaveSurvey", mock.Anything)
	})

	t.Run("in progress survey in database but it doesn't end yet", func(t *testing.T) {
		app, mockedStore := SetupTests(t)

		inProgressSurvey := &model.Survey{
			Duration:  10,
			StartTime: mmModal.GetMillis(),
		}

		mockedStore.On("GetSurveysByStatus", "in_progress").Return([]*model.Survey{inProgressSurvey}, nil)

		err := app.JobManageSurveyStatus()
		require.NoError(t, err)

		mockedStore.AssertExpectations(t)
		mockedStore.AssertNotCalled(t, "UpdateSurveyStatus", mock.Anything, "ended")
		mockedStore.AssertNotCalled(t, "SaveSurvey", mock.Anything)
	})

	t.Run("in progress survey in database that should stop now, but new survey doesn't start yet", func(t *testing.T) {
		app, mockedStore := SetupTests(t)

		tenDaysAgo := time.Now().Add(-10 * 24 * time.Hour).UnixMilli()
		inProgressSurvey := &model.Survey{
			ID:        "survey_1",
			Duration:  5,
			StartTime: tenDaysAgo,
		}

		mockedStore.On("GetSurveysByStatus", "in_progress").Return([]*model.Survey{inProgressSurvey}, nil)
		mockedStore.On("UpdateSurveyStatus", "survey_1", "ended").Return(nil)

		app.getConfig = func() *model.Config {
			return &model.Config{
				SurveyDateTime: model.SurveyDateTime{
					Date: "02/01/3000",
					Time: "15:04",
				},
			}
		}

		err := app.JobManageSurveyStatus()
		require.NoError(t, err)

		mockedStore.AssertExpectations(t)
		mockedStore.AssertNotCalled(t, "SaveSurvey", mock.Anything)
	})

	t.Run("in progress survey in database that should stop now and a new survey can be started", func(t *testing.T) {
		app, mockedStore := SetupTests(t)

		tenDaysAgo := time.Now().Add(-10 * 24 * time.Hour).UnixMilli()
		inProgressSurvey := &model.Survey{
			ID:        "survey_1",
			Duration:  5,
			StartTime: tenDaysAgo,
		}

		mockedStore.On("GetSurveysByStatus", "in_progress").Return([]*model.Survey{inProgressSurvey}, nil)
		mockedStore.On("UpdateSurveyStatus", "survey_1", "ended").Return(nil)
		mockedStore.On("SaveSurvey", mock.Anything).Return(nil)

		app.getConfig = func() *model.Config {
			return &model.Config{
				SurveyExpiry: model.SurveyExpiry{
					Days: 10,
				},
				SurveyDateTime: model.SurveyDateTime{
					Date: "02/01/2006",
					Time: "15:04",
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

		err := app.JobManageSurveyStatus()
		require.NoError(t, err)

		mockedStore.AssertExpectations(t)
	})
}
