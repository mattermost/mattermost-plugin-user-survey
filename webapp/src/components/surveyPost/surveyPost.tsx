// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo, useRef, useState} from 'react';

import Button from 'components/common/button/button';
import {useUserSurvey} from 'components/hooks/survey';
import LinearScaleQuestion from 'components/surveyPost/linearScaleQuestion/linearScaleQuestion';
import TextQuestion from 'components/surveyPost/textQuestion/textQuestion';

import type {MattermostWindow} from 'types/mattermost-webapp';
import type {CustomPostTypeComponentProps, SurveyResponse} from 'types/plugin';

import './style.scss';

import client from 'client/client';

const QUESTION_COMPONENTS = {
    linear_scale: LinearScaleQuestion,
    text: TextQuestion,
};

function SurveyPost({post}: CustomPostTypeComponentProps) {
    const [errorMessage, setErrorMessage] = useState<string>();
    const draftResponse = useRef<SurveyResponse>({
        response: {},
    });

    const {
        survey,
        linearScaleQuestionID,
        surveyExpired,
        responsesExist,
        setResponses,
    } = useUserSurvey(post);

    const disabled = responsesExist || surveyExpired;

    const submitSurveyResponse = useCallback(async () => {
        // make API call here. Send draftResponse.current as payload...
        console.log(draftResponse.current);

        const response = await client.submitSurveyResponse(post.props.survey_id, draftResponse.current);
        console.log(response);
        return {success: true, error: false};
    }, [post.props.survey_id]);

    const submitSurveyHandler = useCallback(async () => {
        if (!draftResponse.current ||
            Object.keys(draftResponse.current?.response).length === 0
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
    }, [setResponses, submitSurveyResponse]);

    // this function is to submit the linear scale rating as soon as a user selects it,
    // even without pressing the submit button.
    const submitRating = useCallback(async () => {
        if (!linearScaleQuestionID.current || !draftResponse.current) {
            return;
        }

        const ratingQuestionResponse = draftResponse.current?.response[linearScaleQuestionID.current];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const payload: SurveyResponse = {
            response: {
                [linearScaleQuestionID.current]: ratingQuestionResponse,
            },
        };

        // send payload to submit survey response API here...
    }, [linearScaleQuestionID]);

    const questionResponseChangeHandler = useCallback(
        (questionID: string, response: string) => {
            if (draftResponse.current) {
                draftResponse.current.response[questionID] = response;
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
                        value={survey.response?.response[question.id] as string}
                    />
                </div>
            );
        });
    }, [disabled, questionResponseChangeHandler, survey]);

    // this is to stop any click event from any of the
    // inner buttons, input fields etc from being propagated and
    // triggering the "click post to open thread" feature.
    // Without this, clicking anywhere inside the survey, even on the button and input fields
    // triggers opening of the post in RHS.
    const stopPropagation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    return (
        <div
            className='CustomSurveyPost vertical'
            onClick={stopPropagation}
        >
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
                        {/*{`Response submitted on ${survey?.response?.dateCreated}.`}*/}
                        {/*    TODO - display submission date embedded in post props */}
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
