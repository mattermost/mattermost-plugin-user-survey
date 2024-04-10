// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useDebouncedCallback} from 'use-debounce';

import Button from 'components/common/button/button';
import LinearScaleQuestion from 'components/surveyPost/linearScaleQuestion/linearScaleQuestion';
import TextQuestion from 'components/surveyPost/textQuestion/textQuestion';

import './style.scss';

import type {
    CustomPostTypeComponentProps,
    MattermostWindow,
    SurveyResponse, UserSurvey,
} from 'types/mattermost-webapp';

function SurveyPost({post, isRHS}: CustomPostTypeComponentProps) {
    const [survey, setSurvey] = useState<UserSurvey>();
    const [disabled, setDisabled] = useState<boolean>(false);
    const [expired, setExpired] = useState<boolean>(false);
    const draftResponse = useRef<SurveyResponse>();
    const [errorMessage, setErrorMessage] = useState<string>();

    const linearScaleQuestionID = useRef<string>();

    const fetchUserSurvey = async (surveyID: string) => {
        // make actual API call to fetch survey here...
        // Replace dummy data with data fetched from API call.
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

        // the first linear scale question is the system default rating question
        const linearScaleQuestion = survey.questions.find((question) => question.type === 'linear_scale');
        linearScaleQuestionID.current = linearScaleQuestion?.id;

        const responsesExist = survey.response !== undefined;
        const surveyExpired = survey.status === 'ended';

        setDisabled(responsesExist || surveyExpired);
        setExpired(surveyExpired);
    };

    // fetch data on initial mount
    useEffect(() => {
        fetchUserSurvey(post.props.surveyID);
    }, [post.props]);

    const questionResponseChangeHandler = useDebouncedCallback(
        (questionID: string, response: unknown) => {
            const newDraftResponse: SurveyResponse = draftResponse.current || {
                responses: {},
                dateCreated: format(new Date(), 'dd/MM/yyyy'),
            };
            newDraftResponse.responses[questionID] = response;
            draftResponse.current = newDraftResponse;

            // if this is the system rating question, submit response ASAP
            if (questionID === linearScaleQuestionID.current) {
                submitRating();
            }
        },
        500,
    );

    const submitSurveyHandler = useCallback(async () => {
        if (!draftResponse.current ||
            Object.keys(draftResponse.current?.responses).length === 0
        ) {
            return;
        }

        const response = await submitSurveyResponse();
        if (response.success && survey !== undefined) {
            const newSurvey: UserSurvey = {
                ...survey,
                response: draftResponse.current,
            };
            setSurvey(newSurvey);
            setErrorMessage('');
            setDisabled(true);
        } else if (response.error) {
            setErrorMessage('Failed to submit survey response. Please try again.');
        }
    }, [survey]);

    const submitSurveyResponse = async () => {
        // make API call here. Send draftResponse.current as payload...
        return {success: true, error: false};
    };

    // this function is to submit the linear scale rating as soon as a user selects it,
    // even without pressing the submit button.
    const submitRating = async () => {
        if (!linearScaleQuestionID.current || !draftResponse.current) {
            return;
        }

        const ratingQuestionResponse = draftResponse.current?.responses[linearScaleQuestionID.current];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const payload: SurveyResponse = {
            responses: {
                [linearScaleQuestionID.current]: ratingQuestionResponse,
            },
            dateCreated: draftResponse.current?.dateCreated,
        };

        // send payload to submit survey response API here...
    };

    const renderedMessage = useMemo(() => {
        // @ts-expect-error window is definitely MattermostWindow in plugins
        const mmWindow = window as MattermostWindow;
        const htmlString = mmWindow.PostUtils.formatText(post.message, {markdown: true});
        return mmWindow.PostUtils.messageHtmlToComponent(htmlString, isRHS);
    }, [post.message, isRHS]);

    const renderQuestions = useMemo(() => {
        if (!survey) {
            return null;
        }

        return survey.questions.map((question) => {
            let questionComponent: React.ReactNode;

            switch (question.type) {
            case 'linear_scale':
                questionComponent = (
                    <LinearScaleQuestion
                        question={question}
                        responseChangeHandler={questionResponseChangeHandler}
                        disabled={disabled}
                        value={survey.response?.responses[question.id] as number}
                    />
                );
                break;
            case 'text':
                questionComponent = (
                    <TextQuestion
                        question={question}
                        responseChangeHandler={questionResponseChangeHandler}
                        disabled={disabled}
                        value={survey.response?.responses[question.id] as string}
                    />);
                break;
            }

            return (
                <div
                    key={question.id}
                    className='question'
                >
                    {questionComponent}
                </div>
            );
        });
    }, [disabled, questionResponseChangeHandler, survey]);

    return (
        <div className='CustomSurveyPost vertical'>
            {renderedMessage}

            <div className='CustomSurveyPost_survey vertical'>
                <div className='questions'>
                    {renderQuestions}
                </div>

                {
                    errorMessage &&
                    <div className='surveyMessage error'>
                        {errorMessage}
                    </div>
                }

                {
                    !disabled &&
                    <div>
                        <Button
                            text='Submit'
                            type='primary'
                            onClick={submitSurveyHandler}
                        />
                    </div>
                }

                {
                    disabled && !expired &&
                    <div className='surveyMessage submitted'>
                        {`Response submitted on ${survey?.response?.dateCreated}.`}
                    </div>
                }

                {
                    disabled && expired &&
                    <div className='surveyMessage submitted'>
                        {`Survey expired on ${survey?.endDate}.`}
                    </div>
                }
            </div>
        </div>
    );
}

export default SurveyPost;
