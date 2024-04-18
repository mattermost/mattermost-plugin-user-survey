// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

type Config struct {
	EnableSurvey    bool           `json:"EnableSurvey"`
	SurveyDateTime  SurveyDateTime `json:"SurveyDateTime"`
	SurveyExpiry    SurveyExpiry   `json:"SurveyExpiry"`
	SurveyQuestions []Question     `json:"SurveyQuestions"`
}

type SurveyDateTime struct {
	Date string `json:"date"`
	Time string `json:"time"`
}

type SurveyExpiry struct {
	Days int `json:"days"`
}
