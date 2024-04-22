// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"fmt"
	"github.com/pkg/errors"
	"time"
)

type Config struct {
	EnableSurvey    bool            `json:"EnableSurvey"`
	SurveyDateTime  SurveyDateTime  `json:"SurveyDateTime"`
	SurveyExpiry    SurveyExpiry    `json:"SurveyExpiry"`
	SurveyQuestions SurveyQuestions `json:"SurveyQuestions"`
	TeamFilter      TeamFilter      `json:"TeamFilter"`
}

type SurveyDateTime struct {
	Date string `json:"date"`
	Time string `json:"time"`
}

type SurveyExpiry struct {
	Days int `json:"days"`
}

type SurveyQuestions struct {
	Questions         []Question `json:"questions"`
	SurveyMessageText string     `json:"surveyMessageText"`
}

type TeamFilter struct {
	FilteredTeamIDs []string `json:"filteredTeamIDs"`
}

func (c *Config) ShouldSurveyStart() (bool, error) {
	fmt.Println("asfdhskjdgfkjsdhgfjhg")
	// survey should start if the UTC date and UTC time have passed
	utcDateTime := time.Now().UTC()
	parsedTime, err := c.ParsedTime()
	if err != nil {
		return false, err
	}

	return utcDateTime.After(parsedTime) || utcDateTime.Equal(parsedTime), nil
}

func (c *Config) ParsedTime() (time.Time, error) {
	layout := "02/01/2006 15:04"
	location, err := time.LoadLocation("UTC")
	if err != nil {
		return time.Time{}, errors.Wrap(err, "failed to load UTC time zone")
	}

	parsedTime, err := time.ParseInLocation(layout, c.SurveyDateTime.Date+" "+c.SurveyDateTime.Time, location)
	if err != nil {
		return time.Time{}, errors.Wrap(err, "failed to parse survey date time from saved config")
	}

	return parsedTime, nil
}
