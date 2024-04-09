// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';

import type {Question} from 'components/systemConsole/questions/questions';

import './style.scss';

export type Props = {
    question: Question;
    responseChangeHandler: (questionID: string, response: string) => void;
    disabled?: boolean;
}

function TextQuestion({question, responseChangeHandler, disabled}: Props) {
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
                    placeholder={`Add your answer here${question.mandatory ? '' : ' (Optional'}`}
                    onChange={changeHandler}
                    disabled={disabled}
                />
            </div>
        </div>
    );
}

export default TextQuestion;
