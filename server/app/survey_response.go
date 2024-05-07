// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

package app

import (
	"encoding/json"
	"fmt"
	"strconv"

	mmModel "github.com/mattermost/mattermost/server/public/model"

	"github.com/pkg/errors"

	"github.com/mattermost/mattermost-plugin-user-survey/server/model"
)

const (
	postPropKeySurveyResponse   = "survey_response"
	postPropKeyResponseCreateAt = "survey_response_create_at"
	postPropKeySurveyStatus     = "survey_status"
	postPropKeySurveyQuestions  = "survey_questions"
	postPropSurveyID            = "survey_id"
	postPropSurveyExpiryDate    = "survey_expire_at"

	postPropValueSurveyStatusSubmitted = "submitted"
	postPropValueSurveyStatusExpired   = "ended"
)

func (a *UserSurveyApp) SaveSurveyResponse(response *model.SurveyResponse) error {
	inProgressSurvey, err := a.GetInProgressSurvey()
	if err != nil {
		a.api.LogError("SaveSurveyResponse: failed to fetch in progress survey", "error", err.Error())
		return errors.Wrap(err, "SaveSurveyResponse: failed to fetch in progress survey")
	}

	// the response should belong to the currently active survey
	if inProgressSurvey.ID != response.SurveyID {
		return errors.New("the survey you're responding to is no longer active")
	}

	err = a.matchSurveyAndResponse(inProgressSurvey, response)
	if err != nil {
		a.api.LogError("SaveSurveyResponse: failed to match survey and response", "error", err.Error())
		return errors.Wrap(err, "SaveSurveyResponse: failed to match survey and response")
	}

	response.SetDefaults()
	err = response.IsValid()
	if err != nil {
		a.api.LogDebug("SaveSurveyResponse: survey is invalid", "error", err.Error())
		return errors.Wrap(err, "SaveSurveyResponse: survey response is invalid")
	}

	existingResponse, err := a.store.GetSurveyResponse(response.UserID, response.SurveyID)
	if err != nil {
		return errors.Wrap(err, "SaveSurveyResponse: failed to get existing user survey response")
	}

	if existingResponse == nil {
		err = a.store.SaveSurveyResponse(response)
		if err != nil {
			return errors.Wrap(err, "SaveSurveyResponse: failed to save response to database")
		}

		err = a.store.IncrementSurveyResponseCount(response.SurveyID)
		if err != nil {
			return errors.Wrap(err, "SaveSurveyResponse: failed to increment survey response count in database")
		}
	} else {
		if existingResponse.ResponseType == model.ResponseTypePartial {
			response.ID = existingResponse.ID
			err = a.store.UpdateSurveyResponse(response)
			if err != nil {
				return errors.Wrap(err, "SaveSurveyResponse: failed to update existing partial survey response")
			}
		} else if existingResponse.ResponseType == model.ResponseTypeComplete {
			return nil
		}
	}

	postID, err := a.getSurveySentToUser(response.UserID, response.SurveyID)
	if err != nil {
		return errors.Wrap(err, "SaveSurveyResponse: failed to fetch KV store entry for user survey")
	}

	if err := a.addResponseInPost(response, postID); err != nil {
		return errors.Wrap(err, fmt.Sprintf("SaveSurveyResponse: failed to add submitted response in post, userID: %s, surveyID: %s responseType: %s", response.UserID, response.SurveyID, response.ResponseType))
	}

	if err := a.updateNPSScoreGroupCount(inProgressSurvey, existingResponse, response); err != nil {
		return errors.Wrap(err, "SaveSurveyResponse: failed to update group counts")
	}

	if response.ResponseType == model.ResponseTypeComplete {
		if err := a.sendAcknowledgementPost(response.UserID, postID); err != nil {
			return errors.Wrap(err, "SaveSurveyResponse: failed to create survey submission ack post")
		}
	}

	return nil
}

func (a *UserSurveyApp) addResponseInPost(response *model.SurveyResponse, postID string) error {
	post, appErr := a.api.GetPost(postID)
	if appErr != nil {
		a.api.LogError("addResponseInPost: failed to get post by ID from plugin API", "postID", postID, "error", appErr.Error())
		return errors.Wrap(errors.New(appErr.Error()), "addResponseInPost: failed to get post by ID from plugin API")
	}

	responseJSON, err := json.Marshal(response.Response)
	if err != nil {
		a.api.LogError("addResponseInPost: failed to marshal survey responses", "error", err.Error())
		return errors.Wrap(err, "addResponseInPost: failed to marshal survey responses")
	}

	post.AddProp(postPropKeySurveyResponse, string(responseJSON))

	if response.ResponseType == model.ResponseTypeComplete {
		post.AddProp(postPropKeyResponseCreateAt, response.CreateAt)
		post.AddProp(postPropKeySurveyStatus, postPropValueSurveyStatusSubmitted)
	}

	_, appErr = a.api.UpdatePost(post)
	if appErr != nil {
		a.api.LogError("addResponseInPost: failed to update post after adding response props", "postID", postID, "error", appErr.Error())
		return errors.Wrap(errors.New(appErr.Error()), "addResponseInPost: failed to update post after adding response props")
	}

	return nil
}

func (a *UserSurveyApp) sendAcknowledgementPost(userID, surveyPostID string) error {
	if a.botID == "" {
		if err := a.ensureSurveyBot(); err != nil {
			return errors.Wrap(err, "sendAcknowledgementPost: failed to ensure bot")
		}
	}

	botUserDM, appErr := a.api.GetDirectChannel(userID, a.botID)
	if appErr != nil {
		errMsg := fmt.Sprintf("sendAcknowledgementPost: failed to create DM between survey bot and user, botID: %s, userID: %s, error: %s", a.botID, userID, appErr.Error())
		a.api.LogError(errMsg)
		return errors.Wrap(errors.New(appErr.Error()), errMsg)
	}

	post := &mmModel.Post{
		UserId:    a.botID,
		Message:   ":tada: Thank you for helping us make Mattermost better!",
		ChannelId: botUserDM.Id,
		RootId:    surveyPostID,
	}

	if _, appErr := a.api.CreatePost(post); appErr != nil {
		a.api.LogError("sendAcknowledgementPost: failed to send survey submission ack post", "user_id", userID, "channelID", botUserDM, "error", appErr.Error())
		return fmt.Errorf("sendAcknowledgementPost: failed to send survey submission ack post, err: %s", appErr.Error())
	}

	return nil
}

func (a *UserSurveyApp) matchSurveyAndResponse(survey *model.Survey, response *model.SurveyResponse) error {
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
		if response.ResponseType != model.ResponseTypeComplete {
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

func (a *UserSurveyApp) UpdatePostForExpiredSurvey(userID, surveyID string) error {
	postID, err := a.getSurveySentToUser(userID, surveyID)
	if err != nil || postID == "" {
		a.api.LogError("UpdatePostForExpiredSurvey: failed to fetch KV store entry for user survey", "userID", userID, "surveyID", surveyID, "error", err.Error())
		return errors.Wrap(err, fmt.Sprintf("UpdatePostForExpiredSurvey: failed to fetch KV store entry for user survey, userID: %s, surveyID: %s", userID, surveyID))
	}

	expiredSurvey, err := a.store.GetSurveysByID(surveyID)
	if err != nil {
		return errors.Wrap(err, "UpdatePostForExpiredSurvey: failed to fetch expired survey from database, surveyID: "+surveyID)
	}

	post, appErr := a.api.GetPost(postID)
	if appErr != nil {
		a.api.LogError("UpdatePostForExpiredSurvey: failed to get post from ID", "userID", userID, "surveyID", surveyID, "error", appErr.Error())
		return errors.Wrap(errors.New(appErr.Error()), "UpdatePostForExpiredSurvey: failed to get post from ID")
	}

	post.AddProp(postPropKeySurveyStatus, postPropValueSurveyStatusExpired)
	post.AddProp(postPropSurveyExpiryDate, expiredSurvey.GetEndTime().Format("02 January 2006"))

	_, appErr = a.api.UpdatePost(post)
	if appErr != nil {
		a.api.LogError("UpdatePostForExpiredSurvey: failed to update post after updating it for expired survey", "userID", userID, "surveyID", surveyID, "error", appErr.Error())
		return errors.Wrap(errors.New(appErr.Error()), fmt.Sprintf("UpdatePostForExpiredSurvey: failed to update post after updating it for expired survey, userID: %s, surveyID: %s", userID, surveyID))
	}

	return nil
}

func (a *UserSurveyApp) updateNPSScoreGroupCount(survey *model.Survey, oldResponse, newResponse *model.SurveyResponse) error {
	// survey table has a column each for number of promoters, neutral and detractors.
	// Depending on the new score, we need to increment the corresponding columns, and
	// depending on the old score, decrement its corresponding column value.
	//
	// Since we store ratings as soon as user selects it, and then we update the whole response
	// when user clicks the "submit" button, it is possible to have an existing response saved
	// in the database already.
	//
	// This function computes three values, either 1 or -1, one for each promoter, neutral and detractors columns.
	// We then add the computed values corresponding to each column in the database, effectively
	// increasing the column corresponding the new score by 1 and incrementing the column
	// corresponding to the old score by -1 (incrementing by -1 is same as decrementing by 1, incrementing by -1 here to keep SQL queries simple).

	systemRatingQuestionID, err := survey.GetSystemRatingQuestionID()
	if err != nil {
		return errors.Wrap(err, "updateNPSScoreGroupCount: failed to find a system rating question in survey")
	}

	var oldPromoterFactor, oldNeutralFactor, oldDetractorFactor int
	var newPromoterFactor, newNeutralFactor, newDetractorFactor int

	newRating, err := strconv.Atoi(newResponse.Response[systemRatingQuestionID])
	if err != nil {
		a.api.LogError("updateNPSScoreGroupCount: failed to convert new rating value from string to number")
		return errors.Wrap(err, "updateNPSScoreGroupCount: failed to convert new rating value from string to number")
	}

	newPromoterFactor, newNeutralFactor, newDetractorFactor = a.getRatingGroupFactors(newRating)

	if oldResponse != nil {
		oldRating, err := strconv.Atoi(oldResponse.Response[systemRatingQuestionID])
		if err != nil {
			a.api.LogError("updateNPSScoreGroupCount: failed to convert new rating value from string to number")
			return errors.Wrap(err, "updateNPSScoreGroupCount: failed to convert new rating value from string to number")
		}

		if !a.hasRatingGroupChanged(oldRating, newRating) {
			// nothing to do if rating groups are unchanged
			return nil
		}

		oldPromoterFactor, oldNeutralFactor, oldDetractorFactor = a.getRatingGroupFactors(oldRating)

		oldPromoterFactor *= -1
		oldNeutralFactor *= -1
		oldDetractorFactor *= -1
	}

	var promoterFactor, neutralFactor, detractorFactor int

	if oldPromoterFactor != 0 {
		promoterFactor = oldNeutralFactor
	} else {
		promoterFactor = newPromoterFactor
	}

	if oldNeutralFactor != 0 {
		neutralFactor = oldNeutralFactor
	} else {
		neutralFactor = newNeutralFactor
	}

	if oldDetractorFactor != 0 {
		detractorFactor = oldDetractorFactor
	} else {
		detractorFactor = newDetractorFactor
	}

	if err := a.store.UpdateRatingGroupCount(survey.ID, promoterFactor, neutralFactor, detractorFactor); err != nil {
		return errors.Wrap(err, "updateNPSScoreGroupCount: failed to update survey rating group count")
	}

	return nil
}

func (a *UserSurveyApp) getRatingGroupFactors(rating int) (promoterFactor, neutralFactor, detractorFactor int) {
	switch {
	case rating >= 1 && rating <= 6:
		detractorFactor = 1
	case rating <= 8:
		neutralFactor = 1
	case rating <= 10:
		promoterFactor = 1
	}

	return promoterFactor, neutralFactor, detractorFactor
}

func (a *UserSurveyApp) hasRatingGroupChanged(oldRating, newRating int) bool {
	if newRating == oldRating {
		return false
	}

	switch {
	case oldRating >= 1 && oldRating <= 6 && newRating >= 1 && newRating <= 6:
		return false
	case oldRating >= 7 && oldRating <= 8 && newRating >= 7 && newRating <= 8:
		return false
	case oldRating >= 9 && oldRating <= 10 && newRating >= 9 && newRating <= 10:
		return false
	default:
		return true
	}
}
