// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import client from 'client/client';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

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
    const draftResponse = useRef<SurveyResponse>();
    const [questionErrorMessages, setQuestionErrorMessages] = useState<{[key: string]: string}>({});

    const {
        questions,
        responses,
        linearScaleQuestionID,
        surveyExpired,
        surveySubmitted,
        setResponses,
        submittedAtDate,
        surveyExpireAtDate,
    } = useUserSurvey(post);

    const disabled = surveySubmitted || surveyExpired;

    useEffect(() => {
        if (!draftResponse.current && responses) {
            draftResponse.current = {...responses};
        }
    }, [responses]);

    useEffect(() => {
        if (!surveyExpired) {
            client.refreshSurveyPost(post.id);
        }
    }, []);

    const validateResponses = useCallback((): boolean => {
        const errors: {[key: string]: string} = {};
        let errorMessage: string = '';

        if (!draftResponse.current) {
            if (linearScaleQuestionID.current) {
                errors[linearScaleQuestionID.current] = 'Please select a rating before submitting the response';
            } else {
                errorMessage = 'Please select a rating before submitting the response';
            }
        }

        questions?.questions.forEach((question) => {
            if (question.id === linearScaleQuestionID.current && !draftResponse.current?.response[question.id]) {
                errors[question.id] = 'Please select a rating before submitting the response';
            }
        });

        setQuestionErrorMessages(errors);
        setErrorMessage(errorMessage);
        return Object.keys(errors).length === 0;
    }, [linearScaleQuestionID, questions?.questions]);

    const submitSurveyResponse = useCallback(async () => {
        if (!draftResponse.current) {
            return {success: false, error: true};
        }

        let success: boolean;

        try {
            await client.submitSurveyResponse(post.props.survey_id, draftResponse.current);
            success = true;
        } catch (error) {
            success = false;
        }

        return {success};
    }, [post.props.survey_id]);

    const submitSurveyHandler = useCallback(async () => {
        if (!validateResponses()) {
            return;
        }

        if (!draftResponse.current) {
            return;
        }

        draftResponse.current.responseType = 'complete';
        const response = await submitSurveyResponse();
        if (response.success) {
            setResponses(draftResponse.current);
            setErrorMessage('');
        } else {
            setErrorMessage('Failed to submit survey response. Please try again.');
        }
    }, [setResponses, submitSurveyResponse, validateResponses]);

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

        client.submitSurveyResponse(post.props.survey_id, payload);
    }, [linearScaleQuestionID, post.props.survey_id]);

    const questionResponseChangeHandler = useCallback(
        (questionID: string, response: string) => {
            if (!draftResponse.current) {
                draftResponse.current = {response: {}} as SurveyResponse;
            }

            draftResponse.current.response[questionID] = response;

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
        if (!questions) {
            return null;
        }

        return questions.questions.map((question) => {
            const Question = QUESTION_COMPONENTS[question.type];
            const questionErrorMessage = questionErrorMessages[question.id];

            return (
                <div
                    key={question.id}
                    className='question'
                >
                    <Question
                        question={question}
                        responseChangeHandler={questionResponseChangeHandler}
                        disabled={disabled}
                        value={responses?.response[question.id] as string}
                    />

                    {
                        !disabled && questionErrorMessage &&
                        <div className='questionErrorMessage error'>
                            {questionErrorMessage}
                        </div>
                    }
                </div>
            );
        });
    }, [disabled, questionErrorMessages, questionResponseChangeHandler, questions, responses?.response]);

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
                    !disabled && errorMessage &&
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
                        {`Response submitted on ${submittedAtDate?.toLocaleDateString()}`}
                    </div>
                }

                {
                    disabled && surveyExpired &&
                    <div className='surveyMessage submitted'>
                        {
                            surveyExpireAtDate ? (`Survey expired on ${surveyExpireAtDate?.toLocaleDateString()}.`) : ('This survey has expired')
                        }
                    </div>
                }
            </div>
        </div>
    );
}

export default SurveyPost;
