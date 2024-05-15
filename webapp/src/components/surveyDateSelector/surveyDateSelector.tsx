// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';

import DatePicker from 'components/common/datePicker';

import './style.scss';
import Icon from 'components/common/icon/icon';

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
    const formattedDate = useMemo(
        () => value.toLocaleDateString(undefined, dateFormattingOptions),
        [value],
    );

    return (
        <DatePicker
            onSelect={onChange}
            value={value}
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
