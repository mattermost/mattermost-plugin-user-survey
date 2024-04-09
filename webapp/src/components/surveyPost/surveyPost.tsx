// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import './style.scss';
import {types} from 'sass';
import {useDebouncedCallback} from 'use-debounce';
import utils from 'utils/utils';

import Button from 'components/common/button/button';
import LinearScaleQuestion from 'components/surveyPost/linearScaleQuestion/linearScaleQuestion';
import TextQuestion from 'components/surveyPost/textQuestion/textQuestion';
import type {Question} from 'components/systemConsole/questions/questions';

import type {CustomPostTypeComponentProps, MattermostWindow, SurveyResponse} from 'types/mattermost-webapp';

import {format, parse} from 'date-fns';

function SurveyPost(props: CustomPostTypeComponentProps) {
    const {post, isRHS} = props;

    const surveyID = useRef<string>(post.props.surveyID);
    const [surveyQuestions, setSurveyQuestions] = useState<Question[]>([]);
    const [savedSurveyResponse, setSavedSurveyResponse] = useState<SurveyResponse>();
    const draftResponse = useRef<SurveyResponse>();
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        // setting dummy survey questions
        setSurveyQuestions([
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
        ]);

        // setting dummy saved response
        setSavedSurveyResponse({
            SurveyID: utils.uuid(),
            Responses: {
                '49fc9a85-b4d8-424e-b13f-40344b168123': '8',
                'aa026055-c97c-48d7-a025-c44590078963': 'Response 1',
                // '0eee4429-5083-41ef-bda7-2ee9c5ece929': 'Response 2',
            },
            DateCreated: format(new Date(), 'dd/MM/yyyy'),
        });
    }, [post.props]);

    const questionResponseChangeHandler = useDebouncedCallback(
        (questionID: string, response: string) => {
            const newDraftResponse: SurveyResponse = draftResponse.current || {
                SurveyID: surveyID.current,
                Responses: {},
                DateCreated: format(new Date(), 'dd/MM/yyyy'),
            };
            newDraftResponse.Responses[questionID] = response;
            draftResponse.current = newDraftResponse;
        },
        500,
    );

    const submitSurveyHandler = useCallback(async () => {
        if (!draftResponse.current || Object.keys(draftResponse.current?.Responses).length === 0) {
            return;
        }

        const response = await submitSurveyResponse();
        if (response.success) {
            setSavedSurveyResponse(draftResponse.current);
            setErrorMessage('');
        } else if (response.error) {
            setErrorMessage('Failed to submit survey response. Please try again.');
        }
    }, []);

    const submitSurveyResponse = async () => {
        // make API call here. Send draftResponse.current as payload...
        console.log(draftResponse.current);
        return {success: true, error: false};
    };

    const renderedMessage = useMemo(() => {
        // @ts-expect-error window is definitely MattermostWindow in plugins
        const mmWindow = window as MattermostWindow;
        const htmlString = mmWindow.PostUtils.formatText(post.message, {markdown: true});
        return mmWindow.PostUtils.messageHtmlToComponent(htmlString, isRHS);
    }, [post.message, isRHS]);

    const renderQuestions = useMemo(() => {
        return surveyQuestions.map((question) => {
            let questionComponent: React.ReactNode;

            switch (question.type) {
            case 'linear_scale':
                questionComponent = (
                    <LinearScaleQuestion
                        question={question}
                        responseChangeHandler={questionResponseChangeHandler}
                        disabled={savedSurveyResponse !== undefined}
                        value={savedSurveyResponse?.Responses[question.id]}
                    />
                );
                break;
            case 'text':
                questionComponent = (
                    <TextQuestion
                        question={question}
                        responseChangeHandler={questionResponseChangeHandler}
                        disabled={savedSurveyResponse !== undefined}
                        value={savedSurveyResponse?.Responses[question.id]}
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
    }, [questionResponseChangeHandler, savedSurveyResponse, surveyQuestions]);

    return (
        <div className='CustomSurveyPost vertical'>
            {renderedMessage}

            <div className='CustomSurveyPost_survey vertical'>
                <div className='questions'>
                    {renderQuestions}
                </div>

                {
                    !savedSurveyResponse &&
                    <div>
                        <Button
                            text='Submit'
                            type='primary'
                            onClick={submitSurveyHandler}
                        />
                    </div>
                }

                {
                    savedSurveyResponse &&
                    <div className='surveyMessage submitted'>
                        {`Response submitted on ${savedSurveyResponse.DateCreated}.`}
                    </div>
                }
            </div>
        </div>
    );
}

export default SurveyPost;
