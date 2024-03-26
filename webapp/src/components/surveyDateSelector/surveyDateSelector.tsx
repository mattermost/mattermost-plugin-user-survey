// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format} from 'date-fns';
import React, {useEffect, useState} from 'react';

import DatePicker from 'components/common/datePicker';

import './style.scss';

const dateFormattingOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: 'numeric',
};

export type Props = {
    value: Date;
    onChange: (value: Date) => void;
};

const SurveyDateSelector = ({value, onChange}: Props) => {
    const [formatedDate, setFormattedDate] = useState<string>('');

    useEffect(() => {
        setFormattedDate(value.toLocaleDateString(undefined, dateFormattingOptions));
    }, [value]);

    return (
        <DatePicker
            onSelect={onChange}
            value={value}
        >
            <div className='SurveyDateSelector form-control'>
                <i className='icon-calendar-outline'/>
                <input
                    className='input'
                    disabled={true}
                    value={formatedDate}
                />
            </div>
        </DatePicker>
    );
};

export default SurveyDateSelector;
