// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {SurveyQuestionsConfig, SurveyResponse} from 'types/plugin';

export function validateSurveyQuestionsConfig(obj: any): asserts obj is SurveyQuestionsConfig {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        throw new Error('Expected an object for SurveyQuestionsConfig, but received a non-object value.');
    }

    if (typeof obj.surveyMessageText !== 'string') {
        throw new Error("SurveyQuestionsConfig must have a 'surveyMessageText' field which is a string.");
    }

    if (!Array.isArray(obj.questions)) {
        throw new Error("SurveyQuestionsConfig must have a 'questions' field which is an array.");
    }

    for (let i = 0; i < obj.questions.length; i++) {
        const question = obj.questions[i];
        if (typeof question !== 'object' || question === null || Array.isArray(question)) {
            throw new Error(`Question at index ${i} in 'questions' array is invalid. Expected an object.`);
        }

        if (typeof question.id !== 'string') {
            throw new Error(`Question at index ${i} in 'questions' array has invalid 'id' field. Expected a string.`);
        }

        if (question.text !== undefined && typeof question.text !== 'string') {
            throw new Error(`Question at index ${i} in 'questions' array has invalid 'text' field. Expected a string or undefined.`);
        }

        if (question.type !== 'linear_scale' && question.type !== 'text') {
            throw new Error(`Question at index ${i} in 'questions' array has invalid 'type' field. Expected 'linear_scale' or 'text'.`);
        }

        if (typeof question.system !== 'boolean') {
            throw new Error(`Question at index ${i} in 'questions' array has invalid 'system' field. Expected a boolean.`);
        }

        if (typeof question.mandatory !== 'boolean') {
            throw new Error(`Question at index ${i} in 'questions' array has invalid 'mandatory' field. Expected a boolean.`);
        }
    }
}

export function validateSurveyResponse(obj: any): asserts obj is SurveyResponse {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        throw new Error('Expected an object for SurveyResponse, but received a non-object value.');
    }

    if (typeof obj.response !== 'object' || obj.response === null || Array.isArray(obj.response)) {
        throw new Error("SurveyResponse must have a 'response' field which is an object.");
    }

    for (const key in obj.response) {
        if (typeof obj.response[key] !== 'string') {
            throw new Error(`The value for key '${key}' in 'response' field must be a string.`);
        }
    }

    if (obj.responseType !== undefined && obj.responseType !== 'partial' && obj.responseType !== 'complete') {
        throw new Error("Invalid value for 'responseType' field. Expected 'partial', 'complete', or undefined.");
    }
}
