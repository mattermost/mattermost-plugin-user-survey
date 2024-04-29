// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback, useEffect, useRef, useState} from 'react';

import type {Post} from '@mattermost/types/posts';

import type {SurveyResponse, UserSurvey} from 'types/plugin';

export function useUserSurvey(post: Post) {
    const [survey, setSurvey] = useState<UserSurvey>();
    const linearScaleQuestionID = useRef<string>();
    const submittedAtDate = useRef<Date>();

    const responsesExist = survey?.response !== undefined;
    const surveyExpired = survey?.status === 'ended';

    useEffect(() => {
        if (!post.props.survey_questions) {
            return;
        }

        const survey = JSON.parse(post.props.survey_questions) as UserSurvey;
        if (post.props.survey_response) {
            survey.response = {
                response: JSON.parse(post.props.survey_response),
            } as SurveyResponse;
        }

        setSurvey(survey);

        // the first system, linear scale question is the system default rating question
        const linearScaleQuestion = survey.questions.find((question) => question.system && question.type === 'linear_scale');

        if (linearScaleQuestion) {
            linearScaleQuestionID.current = linearScaleQuestion.id;
        }

        if (post.props.survey_response_create_at) {
            submittedAtDate.current = new Date(parseInt(post.props.survey_response_create_at, 10));
        }
    }, [post.props.survey_questions, post.props.survey_response]);

    const setResponses = useCallback((responses: SurveyResponse) => {
        setSurvey((oldSurvey) => {
            if (!oldSurvey) {
                return oldSurvey;
            }

            return {
                ...oldSurvey,
                response: responses,
            };
        });
    }, []);

    return {
        survey,
        linearScaleQuestionID,
        responsesExist,
        surveyExpired,
        setResponses,
        submittedAtDate,
    };
}
