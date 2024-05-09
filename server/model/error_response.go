// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package model

type ErrorResponse struct {
	Error     string `json:"error"`
	ErrorCode int    `json:"errorCode"`
}
