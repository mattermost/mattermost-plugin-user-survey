// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {startOfTomorrow} from 'date-fns';
import React, {useCallback, useMemo, useRef} from 'react';

import DatePicker from 'components/common/datePicker';
import Icon from 'components/common/icon/icon';

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
    const tomorrow = useRef(startOfTomorrow());

    const formattedDate = useMemo(
        () => value.toLocaleDateString(undefined, dateFormattingOptions),
        [value],
    );

    const handleOnChange = useCallback((date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        const utcDate = new Date(Date.UTC(year, month, day));

        onChange(utcDate);
    }, [onChange]);

    return (
        <DatePicker
            onSelect={handleOnChange}
            value={value}
            disableBefore={tomorrow.current}
        >
            <div className='SurveyDateSelector form-control'>
                <Icon icon='calendar-outline'/>
                <input
                    className='input'
                    disabled={true}
                    value={formattedDate}
                />
            </div>
        </DatePicker>
    );
};

export default SurveyDateSelector;
