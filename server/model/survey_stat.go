// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

type SurveyStat struct {
	Survey

	ReceiptCount   int64 `json:"receiptCount"`
	ResponseCount  int64 `json:"responseCount"`
	PassiveCount   int64 `json:"passiveCount"`
	PromoterCount  int64 `json:"promoterCount"`
	DetractorCount int64 `json:"detractorCount"`
}
