// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"testing"

	mmModal "github.com/mattermost/mattermost/server/public/model"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

func TestUserSurveyApp_SaveSurveyResponse(t *testing.T) {
	t.Run("base case", func(t *testing.T) {
		th := SetupAppTest(t)

		survey := &model.Survey{
			ID: "survey_id_1",
			SurveyQuestions: model.SurveyQuestions{
				Questions: []model.Question{
					{
						ID:     "question_id_1",
						System: true,
						Type:   model.QuestionTypeLinearScale,
					},
				},
			},
		}

		th.MockedStore.On("GetSurveysByStatus", "in_progress").Return([]*model.Survey{survey}, nil)
		th.MockedStore.On("GetSurveyResponse", "user_1", "survey_id_1").Return(nil, nil)
		th.MockedStore.On("SaveSurveyResponse", mock.Anything).Return(nil)
		th.MockedStore.On("IncrementSurveyResponseCount", "survey_id_1").Return(nil)
		th.MockedStore.On("UpdateRatingGroupCount", "survey_id_1", 1, 0, 0).Return(nil)

		th.MockedPluginAPI.On("GetPost", "post_id_1").Return(&mmModal.Post{}, nil)
		th.MockedPluginAPI.On("UpdatePost", mock.Anything).Return(&mmModal.Post{}, nil)
		th.MockedPluginAPI.On("KVGet", "user_survey_status_user_1_survey_id_1").Return([]byte("post_id_1"), nil)

		response := &model.SurveyResponse{
			SurveyID: "survey_id_1",
			UserID:   "user_1",
			Response: map[string]string{
				"question_id_1": "10",
			},
		}

		err := th.App.SaveSurveyResponse(response)
		require.NoError(t, err)
	})

	t.Run("should not allow submission from user who was never sent this survey", func(t *testing.T) {
		th := SetupAppTest(t)

		survey := &model.Survey{
			ID: "survey_id_1",
			SurveyQuestions: model.SurveyQuestions{
				Questions: []model.Question{
					{
						ID:     "question_id_1",
						System: true,
						Type:   model.QuestionTypeLinearScale,
					},
				},
			},
		}

		th.MockedStore.On("GetSurveysByStatus", "in_progress").Return([]*model.Survey{survey}, nil)
		th.MockedStore.On("GetSurveyResponse", "user_1", "survey_id_1").Return(nil, nil)
		th.MockedPluginAPI.On("KVGet", "user_survey_status_user_1_survey_id_1").Return(nil, nil)

		response := &model.SurveyResponse{
			SurveyID: "survey_id_1",
			UserID:   "user_1",
		}

		err := th.App.SaveSurveyResponse(response)
		require.Error(t, err)
		require.Equal(t, err.Error(), "the survey was not sent to the user")
	})
}
