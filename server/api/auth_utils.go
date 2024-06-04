// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"net/http"

	"github.com/pkg/errors"
)

func (api *Handlers) RequireAuthentication(w http.ResponseWriter, r *http.Request) error {
	userID := r.Header.Get(headerMattermostUserID)
	if userID == "" {
		http.Error(w, "Unauthenticated", http.StatusUnauthorized)
		return errors.New("Unauthenticated user")
	}

	return nil
}

func (api *Handlers) DisallowGuestUsers(w http.ResponseWriter, r *http.Request) error {
	userID := r.Header.Get(headerMattermostUserID)
	user, appErr := api.pluginAPI.GetUser(userID)
	if appErr != nil {
		api.pluginAPI.LogError("DisallowGuestUsers: failed to get user from plugin API", "error", appErr.Error())
		return errors.New(appErr.Error())
	}

	if isGuest := user.IsGuest(); isGuest {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return errors.New("Guest users are not permitted to access this resource")
	}

	return nil
}

func (api *Handlers) RequireSystemAdmin(w http.ResponseWriter, r *http.Request) error {
	userID := r.Header.Get(headerMattermostUserID)
	user, appErr := api.pluginAPI.GetUser(userID)
	if appErr != nil {
		api.pluginAPI.LogError("RequireSystemAdmin: failed to get user from plugin API", "error", appErr.Error())
		return errors.New(appErr.Error())
	}

	if isSysAdmin := user.IsSystemAdmin(); !isSysAdmin {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return errors.New("Only system admins are permitted to access this resource")
	}

	return nil
}

func (api *Handlers) RequireSurveySentToUser(w http.ResponseWriter, r *http.Request, surveyID string) error {
	userID := r.Header.Get(headerMattermostUserID)
	postID, err := api.app.GetSurveyPostIDSentToUser(userID, surveyID)
	if err != nil {
		api.pluginAPI.LogError("RequreSurveySentToUser: failed to get survey post", "error", err.Error(), "surveyID", surveyID)
		http.Error(w, "failed to get survey post", http.StatusInternalServerError)
		return err
	}

	if postID == "" {
		http.Error(w, "Unauthorized", http.StatusForbidden)
		return errors.New("User was not requested for survey post")
	}

	return nil
}
