// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useDebouncedCallback} from 'use-debounce';
import utils from 'utils/utils';

import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';

import type {Question, SurveyQuestionsConfig} from 'types/plugin';

import './style.scss';

export type QuestionType = 'linear_scale' | 'text';

const questionTypeDisplayName = new Map<QuestionType, string>([
    ['linear_scale', 'Linear scale question (1 to 10)'],
    ['text', 'Textual question'],
]);

const DEFAULT_SURVEY_MESSAGE_TEXT = 'Please take a few moments to help us improve your experience with Mattermost.';

function SurveyQuestions({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [surveyMessageText, setSurveyMessageText] = useState<string>(DEFAULT_SURVEY_MESSAGE_TEXT);

    const generateDefaultQuestions = (): Question[] => {
        return [
            {
                id: utils.uuid(),
                text: 'How likely are you to recommend Mattermost?',
                type: 'linear_scale',
                system: true,
                mandatory: true,
            },
            {
                id: utils.uuid(),
                text: 'How can we make your experience better?',
                type: 'text',
                system: true,
                mandatory: true,
            },
            {
                id: utils.uuid(),
                type: 'text',
                system: false,
                mandatory: false,
            },
        ];
    };

    useEffect(() => {
        // Set initial value from saved config
        const questionConfig = config.PluginSettings.Plugins?.['com.mattermost.user-survey']?.systemconsolesetting.SurveyQuestions;
        const initialSavedQuestions = questionConfig?.questions;
        const initialSurveyMessageText = questionConfig?.surveyMessageText;

        const initialSetting: SurveyQuestionsConfig = {
            questions: initialSavedQuestions || generateDefaultQuestions(),
            surveyMessageText: initialSurveyMessageText || DEFAULT_SURVEY_MESSAGE_TEXT,
        };

        setQuestions(initialSetting.questions);
        setSurveyMessageText(initialSetting.surveyMessageText);
        setInitialSetting(id, initialSetting);
    }, [config.PluginSettings.Plugins, id, setInitialSetting]);

    const saveSettings = useCallback((setting: SurveyQuestionsConfig) => {
        setSaveNeeded();
        onChange(id, setting);
    }, [id, onChange, setSaveNeeded]);

    const questionOnChangeHandler = useDebouncedCallback(
        (e: React.ChangeEvent<HTMLInputElement>, questionID: string) => {
            const newQuestions = [...questions];
            const i = questions.findIndex((q) => q.id === questionID);
            newQuestions[i] = {
                ...newQuestions[i],
                text: e.target.value,
            };
            setQuestions(newQuestions);
            saveSettings({
                questions: newQuestions,
                surveyMessageText,
            });
        },
        200,
    );

    const surveyMessageTextChangeHandler = useDebouncedCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSurveyMessageText(e.target.value);
            saveSettings({
                questions,
                surveyMessageText: e.target.value,
            });
        },
        200,
    );

    const renderedQuestions = useMemo(() => {
        return questions.map((question) => {
            return (
                <div
                    key={question.id}
                    className='vertical question'
                >
                    <span className='questionTitle'>
                        {`${questionTypeDisplayName.get(question.type)} ${question.mandatory ? '' : '(Optional)'}`}
                    </span>

                    <input
                        maxLength={1000}
                        className={`form-control questionInput ${question.system && 'disabled'}`}
                        defaultValue={question.text}
                        onChange={(e) => questionOnChangeHandler(e, question.id)}
                        disabled={question.system}
                        placeholder='Question'
                    />
                </div>
            );
        });
    }, [questionOnChangeHandler, questions]);

    return (
        <div className='SurveyQuestions'>
            <div className='header'>
                <h5>{'Survey Questions'}</h5>
                <p>{'View and customise the contents of the next survey'}</p>
            </div>

            <div className='body'>
                <div className='vertical question'>
                    <span className='questionTitle'>
                        {'Survey message text'}
                    </span>

                    <input
                        maxLength={1000}
                        className='form-control questionInput'
                        defaultValue={DEFAULT_SURVEY_MESSAGE_TEXT}
                        placeholder='Survey message text'
                        required={true}
                        onChange={surveyMessageTextChangeHandler}
                    />

                    <span className='questionHelpText'>
                        {'This text will be sent in the bot message preceding the survey.'}
                    </span>
                </div>

                {renderedQuestions}
            </div>

        </div>
    );
}

export default SurveyQuestions;
