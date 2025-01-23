// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useEffect, useRef, useState} from 'react';

import type {Post} from '@mattermost/types/posts';

import type {SurveyQuestionsConfig, SurveyResponse} from 'types/plugin';
import {validateSurveyQuestionsConfig, validateSurveyResponse} from 'types/validators';

export function useUserSurvey(post: Post) {
    const [questions, setQuestions] = useState<SurveyQuestionsConfig>();
    const [responses, setResponses] = useState<SurveyResponse>();
    const [submittedAtDate, setSubmittedAtDate] = useState<Date>();
    const [surveyExpireAtDate, setSurveyExpireAtDate] = useState<Date>();

    const linearScaleQuestionID = useRef<string>();

    const surveySubmitted = post.props.survey_status === 'submitted';
    const surveyExpired = post.props.survey_status === 'ended';

    useEffect(() => {
        if (!post.props.survey_questions) {
            return;
        }

        let questions;
        try {
            questions = JSON.parse(post.props.survey_questions) as unknown;
            validateSurveyQuestionsConfig(questions);
            setQuestions(questions);
        } catch (error) {
            console.error(error);
            return;
        }

        if (post.props.survey_response) {
            try {
                const response = {response: JSON.parse(post.props.survey_response)} as unknown;
                validateSurveyResponse(response);
                setResponses(response);
            } catch (error) {
                console.error(error);
                return;
            }
        }

        // the first system, linear scale question is the system default rating question
        const linearScaleQuestion = questions.questions.find((question) => question.system && question.type === 'linear_scale');

        if (linearScaleQuestion) {
            linearScaleQuestionID.current = linearScaleQuestion.id;
        }

        if (post.props.survey_response_create_at) {
            setSubmittedAtDate(new Date(parseInt(post.props.survey_response_create_at, 10)));
        }

        if (post.props.survey_expire_at) {
            setSurveyExpireAtDate(new Date(parseInt(post.props.survey_expire_at, 10)));
        }
    }, [post.props.survey_expire_at, post.props.survey_questions, post.props.survey_response, post.props.survey_response_create_at]);

    return {
        questions,
        responses,
        linearScaleQuestionID,
        surveySubmitted,
        surveyExpired,
        setResponses,
        submittedAtDate,
        surveyExpireAtDate,
    };
}
