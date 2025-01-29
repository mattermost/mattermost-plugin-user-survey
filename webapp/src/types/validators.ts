// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Question, SurveyQuestionsConfig, SurveyResponse} from 'types/plugin';

export function validateSurveyQuestionsConfig(obj: unknown): asserts obj is SurveyQuestionsConfig {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('Invalid object: not an object');
    }

    const {surveyMessageText, questions} = obj as Partial<SurveyQuestionsConfig>;

    if (typeof surveyMessageText !== 'string') {
        throw new Error('Invalid surveyMessageText: must be a string');
    }

    if (!Array.isArray(questions)) {
        throw new Error('Invalid questions: must be an array');
    }

    for (let i = 0; i < questions.length; i++) {
        const question = questions[i] as Partial<Question>;
        if (
            typeof question !== 'object' ||
            question === null ||
            typeof question.id !== 'string'
        ) {
            throw new Error(`Invalid question at index ${i}: must be an object with an id as string`);
        }

        if (!(question.type === 'linear_scale' || question.type === 'text')) {
            throw new Error(`Invalid question type at index ${i}: must be 'linear_scale' or 'text'`);
        }

        if (typeof question.system !== 'boolean') {
            throw new Error(`Invalid 'system' field at index ${i}: must be a boolean`);
        }

        if (typeof question.mandatory !== 'boolean') {
            throw new Error(`Invalid 'mandatory' field at index ${i}: must be a boolean`);
        }
    }
}

export function validateSurveyResponse(obj: unknown): asserts obj is SurveyResponse {
    if (typeof obj !== 'object' || obj === null) {
        throw new Error('Invalid object: not an object');
    }

    const {response, responseType} = obj as Partial<SurveyResponse>;

    if (typeof response !== 'object' || response === null || Object.keys(response).length === 0) {
        throw new Error('Invalid response: must be a non-empty object');
    }

    if (responseType !== undefined && responseType !== 'partial' && responseType !== 'complete') {
        throw new Error('Invalid responseType: must be "partial" or "complete"');
    }
}
