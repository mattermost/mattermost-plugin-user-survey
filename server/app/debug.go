// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

func (a *UserSurveyApp) ResetData() error {
	return a.store.ResetData()
}
