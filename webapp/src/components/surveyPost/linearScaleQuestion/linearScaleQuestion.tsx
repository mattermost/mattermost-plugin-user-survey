// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo, useState} from 'react';

import type {Question} from 'components/systemConsole/questions/questions';

import './style.scss';
import classNames from 'classnames';

export type Props = {
    question: Question;
    responseChangeHandler: (questionID: string, response: string) => void;
    disabled?: boolean;
}

const scaleStart = 1;
const scaleEnd = 10;

function LinearScaleQuestion({question, responseChangeHandler, disabled}: Props) {
    const [selectedValue, setSelectedValue] = useState<number>();

    const indentClickHandler = useCallback((value: number) => {
        setSelectedValue(value);
        responseChangeHandler(question.id, value.toString());
    }, [question.id, responseChangeHandler]);

    const indents = useMemo(() => {
        const x = [];
        for (let i = scaleStart; i <= scaleEnd; i++) {
            x.push((
                <div
                    className={classNames({indent: true, selected: selectedValue === i})}
                    onClick={() => indentClickHandler(i)}
                >
                    {i}
                </div>
            ));
        }

        return x;
    }, [indentClickHandler, selectedValue]);

    return (
        <div className='LinearScaleQuestion vertical'>
            <div className='questionTitle'>{question.text}</div>
            <div className='scale vertical'>
                <div className='scaleLabels horizontal'>
                    <div className='scaleLabel'>{'Not Likely'}</div>
                    <div className='scaleLabel'>{'Very Likely'}</div>
                </div>
                <div className={classNames({indents: true, disabled})}>
                    {indents}
                </div>
            </div>
        </div>
    );
}

export default LinearScaleQuestion;
