// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"net/http"
)

func (api *APIHandlers) connected(w http.ResponseWriter, r *http.Request) {
	api.pluginAPI.LogInfo("connected APIHandlers called!!!")
}
