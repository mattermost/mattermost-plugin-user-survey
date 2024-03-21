// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format} from 'date-fns';
import React from 'react';

import DatePicker from 'components/common/datePicker';

import './style.scss';

export type Props = {
    value: Date;
    onChange: (value: Date) => void;
};

const SurveyDateSelector = ({value, onChange}: Props) => {
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
                    value={format(value, 'dd/MM/yyyy')}
                />
            </div>
        </DatePicker>
    );
};

export default SurveyDateSelector;
