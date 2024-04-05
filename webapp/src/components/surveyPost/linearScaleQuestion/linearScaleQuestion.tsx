// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';

import type {Question} from 'components/systemConsole/questions/questions';

import './style.scss';

export type Props = {
    question: Question;
}

const scaleStart = 1;
const scaleEnd = 10;

function LinearScaleQuestion({question}: Props) {
    const indents = useMemo(() => {
        const x = [];
        for (let i = scaleStart; i <= scaleEnd; i++) {
            x.push((
                <div className='indent'>{i}</div>
            ));
        }

        return x;
    }, []);

    return (
        <div className='LinearScaleQuestion'>
            <div className='questionTitle'>{question.text}</div>
            <div className='scale'>
                {indents}
            </div>
        </div>
    );
}

export default LinearScaleQuestion;
