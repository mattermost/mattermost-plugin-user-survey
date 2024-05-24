// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useCallback, useMemo, useState} from 'react';
import {useDebouncedCallback} from 'use-debounce';

import type {Question} from 'types/plugin';

import './style.scss';

export type Props = {
    question: Question;
    responseChangeHandler: (questionID: string, response: string) => void;
    disabled?: boolean;
    value?: string;
    scaleStart?: number;
    scaleEnd?: number;
}

function LinearScaleQuestion({
    question,
    responseChangeHandler,
    disabled,
    value,
    scaleStart = 1,
    scaleEnd = 10,
}: Props) {
    const [selectedValue, setSelectedValue] = useState<number | undefined>(value ? Number.parseInt(value, 10) : undefined);

    const debouncedChangeHandler = useDebouncedCallback(responseChangeHandler, 200);

    const indentClickHandler = useCallback((value: number) => {
        setSelectedValue(value);
        debouncedChangeHandler(question.id, value.toString());
    }, [debouncedChangeHandler, question.id]);

    const indents = useMemo(() => {
        const indentElements = [];
        for (let i = scaleStart; i <= scaleEnd; i++) {
            indentElements.push((
                <div
                    key={i}
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
            <label className='questionTitle'>{question.text}</label>
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
