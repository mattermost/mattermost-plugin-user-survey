// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';

import type {DropdownOption} from 'components/common/dropdown/dropdown';
import Dropdown from 'components/common/dropdown/dropdown';

import './style.scss';

export type Props = {
    value?: string;
    onChange: (value: string) => void;
};

const SurveyTimeSelector = ({value, onChange}: Props) => {
    const options = useMemo(() => {
        // we need to generate 24 hour format time from 00:00 (12 am night)
        // to 23:30 (11:30 PM) in 30 minute increment

        const timeStrings: DropdownOption[] = [];

        for (let hours = 0; hours < 24; hours++) {
            for (let minutes = 0; minutes <= 30; minutes += 30) {
                const hourString = String(hours).padStart(2, '0');
                const minuteString = String(minutes).padStart(2, '0');
                const timeString = `${hourString}:${minuteString}`;

                timeStrings.push({value: timeString, label: `${timeString} UTC`});
            }
        }

        return timeStrings;
    }, []);

    const dropdownValue = useMemo(() => (value ? {value, label: `${value} UTC`} : options[18]), [options, value]);

    const onChangeHandler = useCallback((newValue: DropdownOption) => {
        onChange(newValue.value);
    }, [onChange]);

    return (
        <div className='SurveyTimeSelector'>
            <Dropdown
                value={dropdownValue}
                options={options}
                onChange={onChangeHandler}
            />
        </div>
    );
};

export default SurveyTimeSelector;
