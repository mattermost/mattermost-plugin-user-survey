// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo, useRef} from 'react';

import DatePicker from 'components/common/datePicker';
import Icon from 'components/common/icon/icon';

import './style.scss';
import {startOfTomorrow} from 'date-fns';

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

    return (
        <DatePicker
            onSelect={onChange}
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
