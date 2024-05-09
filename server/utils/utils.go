// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package utils

import (
	"encoding/base32"

	"github.com/pborman/uuid"
)

var encoding = base32.NewEncoding("ybndrfg8ejkmcpqxot1uwisza345h769").WithPadding(base32.NoPadding)

// NewID is a globally unique identifier.  It is a [A-Z0-9] string 26
// characters long.  It is a UUID version 4 Guid that is zbased32 encoded
// without the padding.
func NewID() string {
	return encoding.EncodeToString(uuid.NewRandom())
}

func CoalesceInt(values ...int) int {
	for _, v := range values {
		if v != 0 {
			return v
		}
	}
	return 0
}

func CalculateNPS(promoters, detractors, passives int64) float64 {
	totalResponses := promoters + detractors + passives
	if totalResponses == 0 {
		return 0.0
	}

	nps := (float64(promoters)/float64(totalResponses))*100 - (float64(detractors)/float64(totalResponses))*100
	return nps
}
