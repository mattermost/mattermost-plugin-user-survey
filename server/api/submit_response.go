// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package api

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

func (api *Handlers) handleSubmitSurveyResponse(w http.ResponseWriter, r *http.Request) {
	if err := api.RequireAuthentication(w, r); err != nil {
		return
	}

	if err := api.DisallowGuestUsers(w, r); err != nil {
		return
	}

	userID := r.Header.Get(headerMattermostUserID)
	vars := mux.Vars(r)
	surveyID, ok := vars["surveyID"]
	if !ok {
		http.Error(w, "missing survey ID in request", http.StatusBadRequest)
		return
	}

	body := http.MaxBytesReader(w, r.Body, maxPayloadSizeBytes)
	var response *model.SurveyResponse
	if err := json.NewDecoder(body).Decode(&response); err != nil {
		api.pluginAPI.LogError("handleSubmitSurveyResponse: failed to unmarshal request body", "error", err.Error())
		http.Error(w, "failed to read request body", http.StatusInternalServerError)
		return
	}

	response.SurveyID = surveyID
	response.UserID = userID

	// now that we have response, we'll verify that the response matches
	// what is expected in the active survey. For example,
	// the number of questions and answers should match, and the submission should
	// only be against the active survey

	survey, err := api.app.GetInProgressSurvey()
	if err != nil {
		api.pluginAPI.LogError("handleSubmitSurveyResponse: failed to fetch in progress survey", "error", err.Error())
		http.Error(w, "failed to fetch survey", http.StatusInternalServerError)
		return
	}

	if err := matchSurveyAndResponse(surveyID, survey, response); err != nil {
		api.pluginAPI.LogError("handleSubmitSurveyResponse: failed to match survey and response", "error", err.Error())
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := api.app.SaveSurveyResponse(response); err != nil {
		api.pluginAPI.LogError("handleSubmitSurveyResponse: failed to save survey response", "error", err.Error())
		http.Error(w, "failed to save response", http.StatusInternalServerError)
		return
	}

	ReturnStatusOK(w)
}

func matchSurveyAndResponse(surveyID string, survey *model.Survey, response *model.SurveyResponse) error {
	// the response should belong to the currently active survey
	if survey.ID != surveyID {
		return errors.New("the survey you're responding to is no longer active")
	}

	// response can't have more answers than the number of questions in the survey
	if len(response.Response) > len(survey.SurveyQuestions.Questions) {
		return errors.New("incorrect number of responses submitted")
	}

	// if only one response is submitted, it needs to be
	// the answer to the linear scale question
	if len(response.Response) == 1 {
		linearScaleQuestionID, err := survey.GetSystemRatingQuestionID()
		if err != nil {
			return err
		}

		if _, ok := response.Response[linearScaleQuestionID]; !ok {
			return errors.New("linear scale question must be answered")
		}

		// When user selects a rating and submits via the Submit button,
		// the client passes the response type manually, and we should only verify it,
		// not override it.
		if response.ResponseType == "" {
			response.ResponseType = model.ResponseTypePartial
		}
	} else {
		// make sure answered questions belong to the survey
		surveyQuestionIDMap := map[string]bool{}
		for _, question := range survey.SurveyQuestions.Questions {
			surveyQuestionIDMap[question.ID] = true
		}

		for responseQuestionID := range response.Response {
			if _, ok := surveyQuestionIDMap[responseQuestionID]; !ok {
				return errors.New("invalid question ID found in submitted answer")
			}
		}

		response.ResponseType = model.ResponseTypeComplete
	}

	return nil
}
