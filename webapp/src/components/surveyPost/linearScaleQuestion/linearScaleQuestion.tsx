// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useCallback, useMemo, useState} from 'react';

import type {Question} from 'types/mattermost-webapp';

import './style.scss';

export type Props = {
    question: Question;
    responseChangeHandler: (questionID: string, response: number) => void;
    disabled?: boolean;
    value?: number;
    scaleStart?: number;
    scaleEnd?: number;
}

function LinearScaleQuestion({question, responseChangeHandler, disabled, value, scaleStart = 1, scaleEnd = 10}: Props) {
    const [selectedValue, setSelectedValue] = useState<number | undefined>(value);

    const indentClickHandler = useCallback((value: number) => {
        setSelectedValue(value);
        responseChangeHandler(question.id, value);
    }, [question.id, responseChangeHandler]);

    const indents = useMemo(() => {
        const indentElements = [];
        for (let i = scaleStart; i <= scaleEnd; i++) {
            indentElements.push((
                <div
                    className={classNames({indent: true, selected: selectedValue === i})}
                    onClick={() => indentClickHandler(i)}
                >
                    {i}
                </div>
            ));
        }

        return indentElements;
    }, [indentClickHandler, scaleEnd, scaleStart, selectedValue]);

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
