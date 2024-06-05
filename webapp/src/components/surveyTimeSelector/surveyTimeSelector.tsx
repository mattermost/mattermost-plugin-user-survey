// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';

import type {DropdownOption} from 'components/common/dropdown/dropdown';
import Dropdown from 'components/common/dropdown/dropdown';

import './style.scss';
import {useSelector} from 'react-redux';

import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

export type Props = {
    value?: string;
    onChange: (value: string) => void;
};

const SurveyTimeSelector = ({value, onChange}: Props) => {
    const currentUser = useSelector(getCurrentUser);
    const preferences = useSelector(getMyPreferences);

    console.log({currentUser});

    const options = useMemo(() => {
        const useMilitaryTimePreference = preferences[getPreferenceKey('display_settings', 'use_military_time')];

        const use24HourTime = useMilitaryTimePreference && useMilitaryTimePreference.value === 'true';

        return use24HourTime ? generate24HourTimeOptions() : generate12HourTimeOptions();
    }, [preferences]);

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

function generate24HourTimeOptions(): DropdownOption[] {
    const timeStrings: DropdownOption[] = [];

    for (let hours = 0; hours < 24; hours++) {
        for (let minutes = 0; minutes <= 30; minutes += 30) {
            const hourString = String(hours).padStart(2, '0');
            const minuteString = String(minutes).padStart(2, '0');
            const timeString = `${hourString}:${minuteString}`;

            timeStrings.push({value: timeString, label: timeString});
        }
    }

    return timeStrings;
}

function generate12HourTimeOptions(): DropdownOption[] {
    const timeStrings: DropdownOption[] = [];

    for (let hours = 0; hours < 24; hours++) {
        for (let minutes = 0; minutes <= 30; minutes += 30) {
            const hour24String = String(hours).padStart(2, '0');
            const minuteString = String(minutes).padStart(2, '0');
            const valueString = `${hour24String}:${minuteString}`;

            let hour12 = hours % 12;
            hour12 = hour12 === 0 ? 12 : hour12; // Convert 0 to 12 for 12-hour format
            const period = hours < 12 ? 'AM' : 'PM';
            const hour12String = String(hour12).padStart(2, '0');
            const labelString = `${hour12String}:${minuteString} ${period}`;

            timeStrings.push({value: valueString, label: labelString});
        }
    }

    return timeStrings;
}

export default SurveyTimeSelector;
