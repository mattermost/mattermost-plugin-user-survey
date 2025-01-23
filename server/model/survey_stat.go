// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

import (
	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
)

type SurveyStat struct {
	Survey

	ReceiptCount   int64 `json:"receiptCount"`
	ResponseCount  int64 `json:"responseCount"`
	PassiveCount   int64 `json:"passiveCount"`
	PromoterCount  int64 `json:"promoterCount"`
	DetractorCount int64 `json:"detractorCount"`
}

func (stat *SurveyStat) ToMetadata() map[string]interface{} {
	return map[string]interface{}{
		"id":              stat.ID,
		"start_time":      utils.FormatUnixTimeMillis(stat.StartTime),
		"duration":        stat.Duration,
		"questions":       stat.SurveyQuestions.GetMetadata(),
		"receipt_count":   stat.ReceiptCount,
		"response_count":  stat.ResponseCount,
		"passive_count":   stat.PassiveCount,
		"promoter_count":  stat.PromoterCount,
		"detractor_count": stat.DetractorCount,
		"nps_score":       utils.CalculateNPS(stat.PromoterCount, stat.DetractorCount, stat.PassiveCount),
	}
}
