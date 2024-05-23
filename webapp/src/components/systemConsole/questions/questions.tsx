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
    const [surveyMessageText, setSurveyMessageText] = useState<string>();

    const generateDefaultQuestions = (): Question[] => {
        return [
            {
                id: utils.uuid(),
                text: 'How likely are you to suggest this app to someone else?',
                type: 'linear_scale',
                system: true,
                mandatory: true,
                helpText: 'This is a mandatory question that helps calculate the NPS score.',
            },
            {
                id: utils.uuid(),
                text: 'How can we make this app better for you?',
                type: 'text',
                system: true,
                mandatory: true,
                helpText: 'This is a mandatory question that helps gather general user feedback.',
            },
            {
                id: utils.uuid(),
                type: 'text',
                system: false,
                mandatory: false,
                helpText: 'This is an optional customisable question that can be used to gather specific feedback or ask follow up questions.',
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
                surveyMessageText: surveyMessageText || DEFAULT_SURVEY_MESSAGE_TEXT,
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
                    className='horizontal question'
                >
                    <span className='questionTitle settingLabel'>
                        {`${questionTypeDisplayName.get(question.type)} ${question.mandatory ? '' : '(Optional)'}`}
                    </span>

                    <div className='vertical questionBody'>
                        <div className='customSettingComponent'>
                            <input
                                maxLength={1000}
                                className={`form-control questionInput ${question.system && 'disabled'}`}
                                defaultValue={question.text}
                                onChange={(e) => questionOnChangeHandler(e, question.id)}
                                disabled={question.system}
                                placeholder='Question'
                            />
                        </div>

                        <span className='questionHelpText'>
                            {question.helpText}
                        </span>
                    </div>
                </div>
            );
        });
    }, [questionOnChangeHandler, questions]);

    return (
        <div className='SurveyQuestions vertical'>
            <div className='horizontal question'>
                <span className='questionTitle settingLabel'>
                    {'Survey message text'}
                </span>

                <div className='vertical questionBody'>
                    <input
                        maxLength={1000}
                        className='form-control questionInput'
                        defaultValue={surveyMessageText}
                        placeholder='Survey message text'
                        required={true}
                        onChange={surveyMessageTextChangeHandler}
                    />

                    <span className='questionHelpText'>
                        {'This text will be visible in the bot message presenting the survey.'}
                    </span>
                </div>
            </div>

            {renderedQuestions}
        </div>
    );
}

export default SurveyQuestions;
