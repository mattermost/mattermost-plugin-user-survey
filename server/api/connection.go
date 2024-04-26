// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"net/http"
)

func (api *Handlers) handleConnected(w http.ResponseWriter, r *http.Request) {
	// TODO, implement the API here
	api.pluginAPI.LogInfo("handleConnected APIHandlers called!!!")
}
