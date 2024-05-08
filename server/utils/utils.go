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
