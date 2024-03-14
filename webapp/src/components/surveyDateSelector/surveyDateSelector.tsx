// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import {format} from 'date-fns';

import DatePicker from 'components/common/datePicker';

import './style.scss';

export type Props = {
    value: Date
    onChange?: (value: Date) => void
};

const SurveyDateSelector = ({value, onChange}: Props) => {
    const onSelectHandler = useCallback((newValue: Date) => {
        if (onChange) {
            onChange(newValue);
        }
    }, [onChange]);

    return (
        <DatePicker
            onSelect={onSelectHandler}
            value={value}
        >
            <div className='SurveyDateSelector form-control'>
                <i className='icon-calendar-outline'/>
                <input
                    className='input'
                    disabled={true}
                    value={format(value, 'dd/MM/yyyy')}
                />
            </div>
        </DatePicker>
    );
};

export default SurveyDateSelector;
