// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/pkg/errors"
)

func (a *UserSurveyApp) TryLock(key string, now time.Time) (bool, error) {
	timeJSON, err := json.Marshal(now)
	if err != nil {
		a.api.LogError("TryLock: failed to marshal time value", "value", now.String())
		return false, errors.Wrap(err, "TryLock: failed to marshal time value")
	}

	locked, appErr := a.api.KVCompareAndSet(key, nil, timeJSON)
	if appErr != nil {
		msg := fmt.Sprintf("TryLock: failed to save value in KV store via KVCompareAndSet, key: %s, value: %s, error: %s", key, timeJSON, appErr.Error())
		a.api.LogError(msg)
		return false, errors.New(msg)
	}

	return locked, nil
}

func (a *UserSurveyApp) Unlock(key string) error {
	appErr := a.api.KVDelete(key)
	if appErr != nil {
		msg := fmt.Sprintf("Unlock: failed to delete KV store entry, key: %s, error: %s", key, appErr.Error())
		a.api.LogError(msg)
		return errors.New(msg)
	}

	return nil
}
