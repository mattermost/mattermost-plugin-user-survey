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

import {Simulate} from 'react-dom/test-utils';
import {fromZonedTime} from 'date-fns-tz';
import {format} from 'date-fns';

export type Props = {
    value?: string;
    onChange: (value: string) => void;
};

const SurveyTimeSelector = ({value, onChange}: Props) => {
    console.log('SurveyTimeSelector', {value});

    const currentUser = useSelector(getCurrentUser);
    const preferences = useSelector(getMyPreferences);

    const use24HourTime = useMemo(() => {
        const useMilitaryTimePreference = preferences[getPreferenceKey('display_settings', 'use_military_time')];
        return useMilitaryTimePreference && useMilitaryTimePreference.value === 'true';
    }, [preferences]);

    const options = useMemo(() => {
        return use24HourTime ? generate24HourTimeOptions() : generate12HourTimeOptions();
    }, [use24HourTime]);

    const dropdownValue = useMemo(() => {
        console.log({value});
        return options.find((option) => option.value === value);
    }, [options, value]);

    const onChangeHandler = useCallback((newValue: DropdownOption) => {
        // if (!currentUser.timezone) {
        //     return;
        // }
        //
        // const userTimeZone = currentUser.timezone.useAutomaticTimezone ? currentUser.timezone.automaticTimezone : currentUser.timezone?.manualTimezone;
        // const utcTime = convertToUTCTime(newValue.value, use24HourTime, userTimeZone);
        // onChange(utcTime);

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

// function convertToUTCTime(timeString: string, use24HourTime: boolean, localTimeZone: string): string {
//     console.log({timeString, use24HourTime, localTimeZone});
//     const utcTime = fromZonedTime(createDateFromTimeString(timeString, use24HourTime), localTimeZone);
//     console.log({utcTime});
//
//     return format(utcTime, 'HH:mm');
// }
//
// function createDateFromTimeString(timeString: string, use24HourTime: boolean): Date {
//     const now = new Date();
//     const [currentYear, currentMonth, currentDay] = [now.getFullYear(), now.getMonth(), now.getDate()];
//
//     let hours: number;
//     let minutes: number;
//
//     // Check if the time string is in 12-hour format (contains am or pm)
//     // if (use24HourTime) {
//     // 24-hour format
//     const match = timeString.match(/(\d{2}):(\d{2})/);
//     if (match) {
//         hours = parseInt(match[1], 10);
//         minutes = parseInt(match[2], 10);
//     } else {
//         throw new Error('Invalid time format');
//     }
//
//     // } else {
//     //     // Extract hours and minutes, along with am/pm part
//     //     const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
//     //     if (match) {
//     //         hours = parseInt(match[1], 10);
//     //         minutes = parseInt(match[2], 10);
//     //         const period = match[3].toLowerCase();
//     //
//     //         // Convert to 24-hour format if necessary
//     //         if (period === 'pm' && hours < 12) {
//     //             hours += 12;
//     //         }
//     //         if (period === 'am' && hours === 12) {
//     //             hours = 0;
//     //         }
//     //     } else {
//     //         throw new Error('Invalid time format');
//     //     }
//     // }
//
//     return new Date(currentYear, currentMonth, currentDay, hours, minutes);
// }

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
