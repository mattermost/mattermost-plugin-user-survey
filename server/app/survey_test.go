// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"testing"
	"time"

	mmModel "github.com/mattermost/mattermost/server/public/model"
	"github.com/pkg/errors"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

func TestSaveSurvey(t *testing.T) {
	t.Run("base case - empty survey should fail", func(t *testing.T) {
		th := SetupAppTest(t)

		err := th.App.SaveSurvey(&model.Survey{})
		require.Error(t, err, "should return error as empty survey is invalid")
	})

	t.Run("should successfully save a valid survey", func(t *testing.T) {
		th := SetupAppTest(t)
		th.MockedStore.On("SaveSurvey", mock.Anything).Return(nil)

		err := th.App.SaveSurvey(&model.Survey{
			Duration:  100,
			Status:    "in_progress",
			StartTime: time.Now().UnixMilli(),
			SurveyQuestions: model.SurveyQuestions{
				Questions: []model.Question{
					{
						ID:     "question_1",
						Text:   "Question 1",
						System: true,
					},
				},
			},
		})
		require.NoError(t, err)
	})

	t.Run("returns error if store save fails", func(t *testing.T) {
		th := SetupAppTest(t)
		th.MockedStore.On("SaveSurvey", mock.Anything).Return(errors.New("intentional error"))

		err := th.App.SaveSurvey(&model.Survey{
			Duration:  100,
			Status:    "in_progress",
			StartTime: time.Now().UnixMilli(),
			SurveyQuestions: model.SurveyQuestions{
				Questions: []model.Question{
					{
						ID:     "question_1",
						Text:   "Question 1",
						System: true,
					},
				},
			},
		})
		require.Error(t, err)
	})
}

func TestGetInProgressSurvey(t *testing.T) {
	t.Run("should not error if no in progress survey exist", func(t *testing.T) {
		th := SetupAppTest(t)
		th.MockedStore.On("GetSurveysByStatus", "in_progress").Return([]*model.Survey{}, nil)

		survey, err := th.App.GetInProgressSurvey()
		require.NoError(t, err)
		require.Nil(t, survey)
	})

	t.Run("one in progress survey exist", func(t *testing.T) {
		th := SetupAppTest(t)
		th.MockedStore.On("GetSurveysByStatus", "in_progress").Return([]*model.Survey{
			{ID: "survey_1", Status: "in_progress"},
		}, nil)

		survey, err := th.App.GetInProgressSurvey()
		require.NoError(t, err)
		require.NotNil(t, survey)
		require.Equal(t, "survey_1", survey.ID)
	})

	t.Run("more than one in progress survey exist", func(t *testing.T) {
		th := SetupAppTest(t)
		th.MockedStore.On("GetSurveysByStatus", "in_progress").Return([]*model.Survey{
			{ID: "survey_1", Status: "in_progress"},
			{ID: "survey_2", Status: "in_progress"},
		}, nil)

		survey, err := th.App.GetInProgressSurvey()
		require.Error(t, err)
		require.Nil(t, survey)
	})
}

func TestShouldSendSurvey(t *testing.T) {
	t.Run("base case", func(t *testing.T) {
		th := SetupAppTest(t)

		th.MockedPluginAPI.On("KVGet", "user_survey_status_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVGet", "user_team_filter_cache_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVCompareAndSet", "user_lock_user_id", mock.Anything, mock.Anything).Return(true, nil)
		th.MockedPluginAPI.On("KVDelete", "user_lock_user_id").Return(nil)

		th.MockedPluginAPI.On("GetTeamsForUser", "user_id").Return([]*mmModel.Team{
			{Id: "team_id_1"},
			{Id: "team_id_2"},
		}, nil)
		th.MockedPluginAPI.On("KVSetWithExpiry", "user_team_filter_cache_user_id_survey_id", mock.Anything, int64(7200)).Return(nil)

		survey := &model.Survey{
			ID:             "survey_id",
			Status:         "in_progress",
			FilterTeamIDs:  []string{},
			TeamFilterType: model.TeamFilterExcludeSelected,
		}
		should, err := th.App.ShouldSendSurvey("user_id", survey)
		require.NoError(t, err)
		require.True(t, should)
	})

	t.Run("shouldn't send as survey is not in progress", func(t *testing.T) {
		th := SetupAppTest(t)

		th.MockedPluginAPI.On("KVCompareAndSet", "user_lock_user_id", mock.Anything, mock.Anything).Return(true, nil)
		th.MockedPluginAPI.On("KVDelete", "user_lock_user_id").Return(nil)

		survey := &model.Survey{
			ID:             "survey_id",
			Status:         "ended",
			FilterTeamIDs:  []string{},
			TeamFilterType: model.TeamFilterExcludeSelected,
		}
		should, err := th.App.ShouldSendSurvey("user_id", survey)
		require.Error(t, err)
		require.False(t, should)
	})

	t.Run("should not send as user is in a excluded team", func(t *testing.T) {
		th := SetupAppTest(t)

		th.MockedPluginAPI.On("KVGet", "user_survey_status_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVGet", "user_team_filter_cache_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVCompareAndSet", "user_lock_user_id", mock.Anything, mock.Anything).Return(true, nil)
		th.MockedPluginAPI.On("KVDelete", "user_lock_user_id").Return(nil)

		th.MockedPluginAPI.On("GetTeamsForUser", "user_id").Return([]*mmModel.Team{
			{Id: "team_id_1"},
			{Id: "team_id_2"},
		}, nil)
		th.MockedPluginAPI.On("KVSetWithExpiry", "user_team_filter_cache_user_id_survey_id", mock.Anything, int64(7200)).Return(nil)

		survey := &model.Survey{
			ID:             "survey_id",
			Status:         "in_progress",
			FilterTeamIDs:  []string{"team_id_1"},
			TeamFilterType: model.TeamFilterExcludeSelected,
		}
		should, err := th.App.ShouldSendSurvey("user_id", survey)
		require.NoError(t, err)
		require.False(t, should)
	})

	t.Run("should send as user is include team", func(t *testing.T) {
		th := SetupAppTest(t)

		th.MockedPluginAPI.On("KVGet", "user_survey_status_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVGet", "user_team_filter_cache_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVCompareAndSet", "user_lock_user_id", mock.Anything, mock.Anything).Return(true, nil)
		th.MockedPluginAPI.On("KVDelete", "user_lock_user_id").Return(nil)

		th.MockedPluginAPI.On("GetTeamsForUser", "user_id").Return([]*mmModel.Team{
			{Id: "team_id_1"},
			{Id: "team_id_2"},
		}, nil)
		th.MockedPluginAPI.On("KVSetWithExpiry", "user_team_filter_cache_user_id_survey_id", mock.Anything, int64(7200)).Return(nil)

		survey := &model.Survey{
			ID:             "survey_id",
			Status:         "in_progress",
			FilterTeamIDs:  []string{"team_id_1"},
			TeamFilterType: model.TeamFilterIncludeSelected,
		}
		should, err := th.App.ShouldSendSurvey("user_id", survey)
		require.NoError(t, err)
		require.True(t, should)
	})
	t.Run("should send as no team filter is set", func(t *testing.T) {
		th := SetupAppTest(t)

		th.MockedPluginAPI.On("KVGet", "user_survey_status_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVGet", "user_team_filter_cache_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVCompareAndSet", "user_lock_user_id", mock.Anything, mock.Anything).Return(true, nil)
		th.MockedPluginAPI.On("KVDelete", "user_lock_user_id").Return(nil)
		th.MockedPluginAPI.On("KVSetWithExpiry", "user_team_filter_cache_user_id_survey_id", mock.Anything, int64(7200)).Return(nil)

		survey := &model.Survey{
			ID:             "survey_id",
			Status:         "in_progress",
			FilterTeamIDs:  []string{"team_id_1"},
			TeamFilterType: model.TeamFilterSendToAll,
		}
		should, err := th.App.ShouldSendSurvey("user_id", survey)
		require.NoError(t, err)
		require.True(t, should)
	})

	t.Run("excluding selected teams but not mentioning any team should send to all", func(t *testing.T) {
		th := SetupAppTest(t)

		th.MockedPluginAPI.On("KVGet", "user_survey_status_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVGet", "user_team_filter_cache_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVCompareAndSet", "user_lock_user_id", mock.Anything, mock.Anything).Return(true, nil)
		th.MockedPluginAPI.On("KVDelete", "user_lock_user_id").Return(nil)

		th.MockedPluginAPI.On("GetTeamsForUser", "user_id").Return([]*mmModel.Team{
			{Id: "team_id_1"},
			{Id: "team_id_2"},
		}, nil)
		th.MockedPluginAPI.On("KVSetWithExpiry", "user_team_filter_cache_user_id_survey_id", mock.Anything, int64(7200)).Return(nil)

		survey := &model.Survey{
			ID:             "survey_id",
			Status:         "in_progress",
			FilterTeamIDs:  []string{},
			TeamFilterType: model.TeamFilterExcludeSelected,
		}
		should, err := th.App.ShouldSendSurvey("user_id", survey)
		require.NoError(t, err)
		require.True(t, should)
	})

	t.Run("including selected teams but not mentioning any team should not send to anyone", func(t *testing.T) {
		th := SetupAppTest(t)

		th.MockedPluginAPI.On("KVGet", "user_survey_status_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVGet", "user_team_filter_cache_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVCompareAndSet", "user_lock_user_id", mock.Anything, mock.Anything).Return(true, nil)
		th.MockedPluginAPI.On("KVDelete", "user_lock_user_id").Return(nil)

		th.MockedPluginAPI.On("GetTeamsForUser", "user_id").Return([]*mmModel.Team{
			{Id: "team_id_1"},
			{Id: "team_id_2"},
		}, nil)
		th.MockedPluginAPI.On("KVSetWithExpiry", "user_team_filter_cache_user_id_survey_id", mock.Anything, int64(7200)).Return(nil)

		survey := &model.Survey{
			ID:             "survey_id",
			Status:         "in_progress",
			FilterTeamIDs:  []string{},
			TeamFilterType: model.TeamFilterIncludeSelected,
		}
		should, err := th.App.ShouldSendSurvey("user_id", survey)
		require.NoError(t, err)
		require.False(t, should)
	})

	t.Run("should use cached value to check for team filter if a cached value is present", func(t *testing.T) {
		th := SetupAppTest(t)

		th.MockedPluginAPI.On("KVGet", "user_survey_status_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVGet", "user_team_filter_cache_user_id_survey_id").Return([]byte("true"), nil)
		th.MockedPluginAPI.On("KVCompareAndSet", "user_lock_user_id", mock.Anything, mock.Anything).Return(true, nil)
		th.MockedPluginAPI.On("KVDelete", "user_lock_user_id").Return(nil)

		survey := &model.Survey{
			ID:             "survey_id",
			Status:         "in_progress",
			FilterTeamIDs:  []string{"team_id_1"},
			TeamFilterType: model.TeamFilterExcludeSelected,
		}
		should, err := th.App.ShouldSendSurvey("user_id", survey)
		require.NoError(t, err)
		require.False(t, should)
	})

	t.Run("should send survey based on cache value", func(t *testing.T) {
		th := SetupAppTest(t)

		th.MockedPluginAPI.On("KVGet", "user_survey_status_user_id_survey_id").Return(nil, nil)
		th.MockedPluginAPI.On("KVGet", "user_team_filter_cache_user_id_survey_id").Return([]byte("false"), nil)
		th.MockedPluginAPI.On("KVCompareAndSet", "user_lock_user_id", mock.Anything, mock.Anything).Return(true, nil)
		th.MockedPluginAPI.On("KVDelete", "user_lock_user_id").Return(nil)

		survey := &model.Survey{
			ID:             "survey_id",
			Status:         "in_progress",
			FilterTeamIDs:  []string{"team_id_1"},
			TeamFilterType: model.TeamFilterExcludeSelected,
		}
		should, err := th.App.ShouldSendSurvey("user_id", survey)
		require.NoError(t, err)
		require.True(t, should)
	})
}
