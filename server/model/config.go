// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"encoding/json"
	"time"

	mmModel "github.com/mattermost/mattermost/server/public/model"
)

type Config struct {
	EnableSurvey    bool            `json:"EnableSurvey"`
	SurveyDateTime  SurveyDateTime  `json:"SurveyDateTime"`
	SurveyExpiry    SurveyExpiry    `json:"SurveyExpiry"`
	SurveyQuestions SurveyQuestions `json:"SurveyQuestions"`
	TeamFilter      TeamFilter      `json:"TeamFilter"`
}

type SurveyDateTime struct {
	Timestamp int64 `json:"timestamp"`
}

type SurveyExpiry struct {
	Days int `json:"days"`
}

type SurveyQuestions struct {
	Questions         []Question `json:"questions"`
	SurveyMessageText string     `json:"surveyMessageText"`
}

func (sq *SurveyQuestions) GetMetadata() []interface{} {
	metadata := []interface{}{}

	for _, question := range sq.Questions {
		metadata = append(metadata, map[string]string{
			"id":   question.ID,
			"text": question.Text,
			"type": question.Type,
		})
	}

	return metadata
}

type TeamFilter struct {
	FilteredTeamIDs []string `json:"filteredTeamIDs"`
}

func (c *Config) ShouldSurveyStart() (bool, error) {
	if c.SurveyDateTime.Timestamp == 0 {
		return false, nil
	}

	// survey should start if the UTC date and UTC time have passed
	utcDateTime := time.Now().UTC()
	//parsedTime, err := c.ParsedTime()
	//if err != nil {
	//	return false, err
	//}

	parsedTime := c.ParsedTime()

	return utcDateTime.After(parsedTime) || utcDateTime.Equal(parsedTime), nil
}

func (c *Config) ParsedTime() time.Time {
	//layout := "02/01/2006 15:04"
	//location, err := time.LoadLocation("UTC")
	//if err != nil {
	//	return time.Time{}, errors.Wrap(err, "failed to load UTC time zone")
	//}
	//
	//parsedTime, err := time.ParseInLocation(layout, c.SurveyDateTime.Date+" "+c.SurveyDateTime.Time, location)
	//if err != nil {
	//	return time.Time{}, errors.Wrap(err, "failed to parse survey date time from saved config")
	//}
	//
	//return parsedTime, nil

	return mmModel.GetTimeForMillis(c.SurveyDateTime.Timestamp)
}

func (c *Config) ToMap() (map[string]interface{}, error) {
	var out map[string]interface{}
	data, err := json.Marshal(c)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(data, &out)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"systemconsolesetting": out,
	}, nil
}
