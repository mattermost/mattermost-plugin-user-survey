// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

const (
	SurveyStatusDraft = "draft"

	QuestionTypeLinearScale = "linear_scale"
	QuestionType            = "text"
)

type Survey struct {
	Id              string     `json:"id"`
	ExcludedTeamIDs []string   `json:"excludedTeamIDs"`
	CreateAt        int64      `json:"createAt"`
	UpdateAt        int64      `json:"updateAt"`
	StartTime       int64      `json:"startTime"`
	Duration        int        `json:"duration"`
	Questions       []Question `json:"questions"`
	Status          string     `json:"status"`
}

type Question struct {
	Id        string `json:"id"`
	Text      string `json:"text"`
	Type      string `json:"type"`
	System    bool   `json:"system"`
	Mandatory bool   `json:"mandatory"`
}
