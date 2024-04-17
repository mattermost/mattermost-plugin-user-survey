// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useCallback, useEffect, useRef, useState} from 'react';

import type {SurveyResponse, UserSurvey} from 'types/plugin';

export function useUserSurvey(surveyID: string) {
    const [survey, setSurvey] = useState<UserSurvey>();
    const linearScaleQuestionID = useRef<string>();

    const responsesExist = survey?.response !== undefined;
    const surveyExpired = survey?.status === 'ended';

    const fetchUserSurvey = async (surveyID: string) => {
        // make API call here to get user survey...
        const survey: UserSurvey = {
            surveyId: surveyID,
            startDate: '01/04/2024',
            endDate: '30/04/2024',
            questions: [
                {
                    id: '49fc9a85-b4d8-424e-b13f-40344b168123',
                    mandatory: true,
                    system: true,
                    text: 'How likely are you to recommend Mattermost?',
                    type: 'linear_scale',
                },
                {
                    id: 'aa026055-c97c-48d7-a025-c44590078963',
                    mandatory: true,
                    system: true,
                    text: 'How can we make your experience better?',
                    type: 'text',
                },
                {
                    id: '0eee4429-5083-41ef-bda7-2ee9c5ece929',
                    mandatory: false,
                    system: false,
                    text: 'option question text',
                    type: 'text',
                },
            ],
            status: 'in_progress',

            // response: {
            //     responses: {
            //         '49fc9a85-b4d8-424e-b13f-40344b168123': '8',
            //         'aa026055-c97c-48d7-a025-c44590078963': 'Response 1',
            //         '0eee4429-5083-41ef-bda7-2ee9c5ece929': 'Response 2',
            //     },
            //     dateCreated: format(new Date(), 'dd/MM/yyyy'),
            // },
        };

        setSurvey(survey);

        // the first system, linear scale question is the system default rating question
        const linearScaleQuestion = survey.questions.find((question) => question.system && question.type === 'linear_scale');

        if (linearScaleQuestion) {
            linearScaleQuestionID.current = linearScaleQuestion.id;
        }
    };

    useEffect(() => {
        fetchUserSurvey(surveyID);
    }, [surveyID]);

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
    };
}
