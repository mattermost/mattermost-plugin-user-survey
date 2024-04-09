// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';

import type {Question} from 'types/mattermost-webapp';

import './style.scss';

export type Props = {
    question: Question;
    responseChangeHandler: (questionID: string, response: string) => void;
    disabled?: boolean;
    value?: string;
}

function TextQuestion({question, responseChangeHandler, disabled, value}: Props) {
    const changeHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        responseChangeHandler(question.id, e.target.value);
    }, [question.id, responseChangeHandler]);

    return (
        <div className='TextQuestion vertical'>
            <div className='questionTitle'>{question.text}</div>
            <div>
                <input
                    maxLength={5000}
                    className='form-control questionInput'
                    placeholder={disabled ? '' : `Add your answer here${question.mandatory ? '' : ' (Optional)'}`}
                    onChange={changeHandler}
                    disabled={disabled}
                    value={value}
                />
            </div>
        </div>
    );
}

export default TextQuestion;
