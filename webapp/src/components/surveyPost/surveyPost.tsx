// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format} from 'date-fns';
import React, {useCallback, useMemo, useRef, useState} from 'react';

import Button from 'components/common/button/button';
import {useUserSurvey} from 'components/hooks/survey';
import LinearScaleQuestion from 'components/surveyPost/linearScaleQuestion/linearScaleQuestion';
import TextQuestion from 'components/surveyPost/textQuestion/textQuestion';

import type {MattermostWindow} from 'types/mattermost-webapp';
import type {CustomPostTypeComponentProps, SurveyResponse} from 'types/plugin';

import './style.scss';

const QUESTION_COMPONENTS = {
    linear_scale: LinearScaleQuestion,
    text: TextQuestion,
};

function SurveyPost({post}: CustomPostTypeComponentProps) {
    const [errorMessage, setErrorMessage] = useState<string>();
    const draftResponse = useRef<SurveyResponse>({
        responses: {},
        dateCreated: format(new Date(), 'dd/MM/yyyy'),
    });

    const {
        survey,
        linearScaleQuestionID,
        surveyExpired,
        responsesExist,
        setResponses,
    } = useUserSurvey(post);

    const disabled = responsesExist || surveyExpired;

    const submitSurveyHandler = useCallback(async () => {
        if (!draftResponse.current ||
            Object.keys(draftResponse.current?.responses).length === 0
        ) {
            return;
        }

        const response = await submitSurveyResponse();
        if (response.success) {
            setResponses(draftResponse.current);
            setErrorMessage('');
        } else if (response.error) {
            setErrorMessage('Failed to submit survey response. Please try again.');
        }
    }, [setResponses]);

    const submitSurveyResponse = async () => {
        // make API call here. Send draftResponse.current as payload...
        return {success: true, error: false};
    };

    // this function is to submit the linear scale rating as soon as a user selects it,
    // even without pressing the submit button.
    const submitRating = useCallback(async () => {
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
    }, [linearScaleQuestionID]);

    const questionResponseChangeHandler = useCallback(
        (questionID: string, response: unknown) => {
            if (draftResponse.current) {
                draftResponse.current.responses[questionID] = response;
            }

            // if this is the system rating question, submit response ASAP
            if (questionID === linearScaleQuestionID.current) {
                submitRating();
            }
        },
        [linearScaleQuestionID, submitRating],
    );

    const renderedMessage = useMemo(() => {
        // @ts-expect-error window is definitely MattermostWindow in plugins
        const mmWindow = window as MattermostWindow;
        const htmlString = mmWindow.PostUtils.formatText(post.message, {markdown: true, mentionHighlight: true, atMentions: true});
        return mmWindow.PostUtils.messageHtmlToComponent(htmlString);
    }, [post.message]);

    const renderQuestions = useMemo(() => {
        if (!survey) {
            return null;
        }

        return survey.questions.map((question) => {
            const Question = QUESTION_COMPONENTS[question.type];

            return (
                <div
                    key={question.id}
                    className='question'
                >
                    <Question
                        question={question}
                        responseChangeHandler={questionResponseChangeHandler}
                        disabled={disabled}
                        value={survey.response?.responses[question.id] as string}
                    />
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
                            buttonType='primary'
                            onClick={submitSurveyHandler}
                        />
                    </div>
                }

                {
                    disabled && !surveyExpired &&
                    <div className='surveyMessage submitted'>
                        {`Response submitted on ${survey?.response?.dateCreated}.`}
                    </div>
                }

                {
                    disabled && surveyExpired &&
                    <div className='surveyMessage submitted'>
                        {`Survey expired on ${survey?.endDate}.`}
                    </div>
                }
            </div>
        </div>
    );
}

export default SurveyPost;
