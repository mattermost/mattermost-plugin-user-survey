// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package main

import (
	"encoding/json"
	"strings"
	"time"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/utils"
)

func (p *Plugin) clearStaleLocks() error {
	utcNow := time.Now().UTC()
	page := 0
	perPage := 500

	for {
		keys, appErr := p.API.KVList(page, perPage)
		if appErr != nil {
			p.API.LogError("clearStaleLocks: failed to execute KVList", "page", page, "per_page", perPage, "error", appErr.Error())
			return errors.Wrap(errors.New(appErr.Error()), "clearStaleLocks: failed to execute KVList")
		}

		for _, key := range keys {
			p.API.LogInfo("##### " + key)

			if !strings.HasPrefix(key, utils.UserLockKeyPrefix) {
				continue
			}

			value, appErr := p.API.KVGet(key)
			if appErr != nil {
				p.API.LogError("clearStaleLocks: failed to get key value from KV store", "key", key, "error", appErr.Error())
				return errors.Wrap(errors.New(appErr.Error()), "clearStaleLocks: failed to get key value from KV store")
			}

			var t time.Time
			_ = json.Unmarshal(value, &t)

			if utcNow.Sub(t) >= LockExpiration {
				deleted, appErr := p.API.KVCompareAndDelete(key, value)
				if appErr != nil {
					p.API.LogError("clearStaleLocks: failed to delete KV store entry when removing stale lock", "key", key, "value", value, "error", appErr.Error())
					return errors.Wrap(errors.New(appErr.Error()), "clearStaleLocks: failed to delete KV store entry when removing stale lock")
				}

				if deleted {
					p.API.LogInfo("Freed expired lock", "key", key)
				}
			}
		}

		if len(keys) < perPage {
			break
		}

		page++
	}

	return nil
}
