package utils

import (
	"encoding/base32"

	"github.com/google/uuid"
)

var encoding = base32.NewEncoding("ybndrfg8ejkmcpqxot1uwisza345h769").WithPadding(base32.NoPadding)

// NewID is a globally unique identifier.  It is a [A-Z0-9] string 26
// characters long.  It is a UUID version 4 Guid that is zbased32 encoded
// without the padding.
func NewID() string {
	return encoding.EncodeToString(newRandom()[:])
}

func newRandom() *uuid.UUID {
	id, err := uuid.NewRandom()
	if err != nil {
		return nil
	}

	return &id
}

func CoalesceInt(values ...int) int {
	for _, v := range values {
		if v != 0 {
			return v
		}
	}
	return 0
}
