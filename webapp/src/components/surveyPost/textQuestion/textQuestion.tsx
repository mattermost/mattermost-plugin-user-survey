// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {useDebouncedCallback} from 'use-debounce';

import type {Question} from 'types/plugin';

import './style.scss';

export type Props = {
    question: Question;
    responseChangeHandler: (questionID: string, response: string) => void;
    disabled?: boolean;
    value?: string;
}

function TextQuestion({question, responseChangeHandler, disabled, value}: Props) {
    const changeHandler = useDebouncedCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        responseChangeHandler(question.id, e.target.value);
    }, 200);

    return (
        <div className='TextQuestion vertical'>
            <label
                className='questionTitle'
                htmlFor={`surveyQuestion_${question.id}`}
            >
                {question.text}
            </label>
            <div>
                <input
                    id={`surveyQuestion_${question.id}`}
                    maxLength={5000}
                    className='form-control questionInput'
                    placeholder={disabled ? '' : `Add your answer here${question.mandatory ? '' : ' (Optional)'}`}
                    onChange={changeHandler}
                    disabled={disabled}
                    defaultValue={value}
                />
            </div>
        </div>
    );
}

export default TextQuestion;
