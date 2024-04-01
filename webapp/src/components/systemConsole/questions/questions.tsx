// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEventHandler, useCallback, useEffect, useMemo, useState} from 'react';

import type {CustomComponentProps, SurveyQuestionsConfig} from 'types/mattermost-webapp';

import './style.scss';
import {useDebouncedCallback} from 'use-debounce';
import utils from 'utils/utils';

export type QuestionType = 'linear_scale' | 'text';

const questionTypeDisplayName = new Map<QuestionType, string>([
    ['linear_scale', 'Linear scale question (1 to 10)'],
    ['text', 'Textual question'],
]);

export type Question = {
    id: string;
    title?: string;
    text?: string;
    type: QuestionType;
    system: boolean;
    mandatory: boolean;
    helpText?: string;
};

function SurveyQuestions({id, setSaveNeeded, onChange, config}: CustomComponentProps) {
    const [questions, setQuestions] = useState<Question[]>([]);

    const generateDefaultQuestions = (): Question[] => {
        console.log('generateDefaultQuestions called');
        return [
            {
                id: utils.uuid(),
                title: 'Survey message text',
                text: 'Please take a few moments to help us improve your experience with Mattermost.',
                type: 'text',
                system: false,
                mandatory: true,
                helpText: 'This text will be sent in the bot message preceding the survey.',
            },
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
        const savedQuestions = config.PluginSettings.Plugins?.['com.mattermost.user-survey']?.surveyquestions;

        if (savedQuestions) {
            setQuestions(savedQuestions);
        } else {
            setQuestions(generateDefaultQuestions());
        }
    }, [config.PluginSettings?.Plugins]);

    const saveSettings = useCallback((setting: SurveyQuestionsConfig) => {
        setSaveNeeded();
        onChange(id, setting);
    }, [id, onChange, setSaveNeeded]);

    const questionOnChangeHandler = useDebouncedCallback(
        useCallback((e: React.ChangeEvent<HTMLInputElement>, questionID: string) => {
            const newQuestions = questions;
            const i = questions.findIndex((q) => q.id === questionID);
            newQuestions[i].text = e.target.value;
            setQuestions(newQuestions);
            saveSettings(newQuestions);
        }, [questions, saveSettings]),
        500,
    );

    const renderQuestions = useMemo(() => {
        return questions.map((question) => {
            return (
                <div
                    key={question.id}
                    className='vertical question'
                >
                    <span className='questionTitle'>
                        {question.title && question.title}
                        {
                            !question.title &&
                            (`${questionTypeDisplayName.get(question.type)} ${question.mandatory ? '' : '(Optional)'}`)
                        }
                    </span>

                    <input
                        maxLength={1000}
                        className={`form-control questionInput ${question.system && 'disabled'}`}
                        defaultValue={question.text}
                        onChange={(e) => questionOnChangeHandler(e, question.id)}
                        disabled={question.system}
                        placeholder='Question'
                    />

                    {
                        question.helpText &&
                        (
                            <span className='questionHelpText'>
                                {question.helpText}
                            </span>
                        )
                    }
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
                {renderQuestions}
            </div>

        </div>
    );
}

export default SurveyQuestions;
