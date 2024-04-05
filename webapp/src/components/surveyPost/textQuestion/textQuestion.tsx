// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {Question} from 'components/systemConsole/questions/questions';

import './style.scss';

export type Props = {
    question: Question;
}

function TextQuestion({question}: Props) {
    return (
        <div className='TextQuestion vertical'>
            <div className='questionTitle'>{question.text}</div>
            <div>
                <input
                    maxLength={5000}
                    className='form-control questionInput'
                    placeholder={`Add your answer here${question.mandatory ? '' : ' (Optional'}`}
                />
            </div>
        </div>
    );
}

export default TextQuestion;
