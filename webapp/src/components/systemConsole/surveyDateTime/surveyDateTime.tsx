// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format, parse} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

import {getMyPreferences} from 'mattermost-redux/selectors/entities/preferences';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {getPreferenceKey} from 'mattermost-redux/utils/preference_utils';

import SurveyDateSelector from 'components/surveyDateSelector/surveyDateSelector';
import SurveyTimeSelector from 'components/surveyTimeSelector/surveyTimeSelector';
import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';

import type {DateTimeConfig} from 'types/plugin';

import './style.scss';

import {formatInTimeZone, fromZonedTime, toZonedTime} from 'date-fns-tz';

// const DEFAULT_SURVEY_TIME = '00:00';

function SurveyDateTime({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    const currentUser = useSelector(getCurrentUser);
    const userTimeZone = currentUser.timezone?.useAutomaticTimezone === 'true' ? currentUser.timezone.automaticTimezone : currentUser.timezone?.manualTimezone;

    const preferences = useSelector(getMyPreferences);

    const use24HourTime = useMemo(() => {
        const useMilitaryTimePreference = preferences[getPreferenceKey('display_settings', 'use_military_time')];
        return useMilitaryTimePreference && useMilitaryTimePreference.value === 'true';
    }, [preferences]);

    console.log({currentUser, userTimeZone, use24HourTime});

    const [surveyTime, setSurveyTime] = useState<string>();
    const [surveyDate, setSurveyDate] = useState<Date>();

    const [utcSurveyTime, setUTCSurveyTime] = useState<string>();
    const [utcSurveyDate, setUTCSurveyDate] = useState<Date>();

    const [surveyDateTime, setSurveyDateTime] = useState<Date>();

    useEffect(() => {// Extract date components from the UTC Date object
        if (!surveyDate || !surveyTime) {
            return;
        }

        console.log({surveyDate, surveyTime});

        const year = surveyDate.getFullYear();
        const month = surveyDate.getMonth(); // getUTCMonth() returns month index (0-11)
        const day = surveyDate.getDate();

        // Parse time components from timeString
        const [hours, minutes] = surveyTime.split(':').map(Number);

        // Construct a new Date object in UTC with the combined date and time
        // Convert the UTC Date object to the user's local time zone
        setSurveyDateTime(new Date(year, month, day, hours, minutes));
    }, [surveyDate, surveyTime]);

    // sets the date picker and time picker to the values saved in config on load
    useEffect(() => {
        if (!userTimeZone) {
            return;
        }

        const dateTimeConfig = config.PluginSettings?.Plugins?.['com.mattermost.user-survey']?.systemconsolesetting.SurveyDateTime;

        const initialConfig: DateTimeConfig = {};

        if (dateTimeConfig?.time) {
            setUTCSurveyTime(dateTimeConfig.time);

            const localTime = toZonedTime(parse(dateTimeConfig.time, 'HH:mm', new Date()), userTimeZone);
            setSurveyTime(format(localTime, 'HH:mm'));

            initialConfig.time = dateTimeConfig.time;
        }

        if (dateTimeConfig?.date) {
            const utcDate = parse(dateTimeConfig.date, 'dd/MM/yyyy', new Date());
            setUTCSurveyDate(utcDate);

            const localDate = toZonedTime(utcDate, userTimeZone);
            setSurveyDate(localDate);
            initialConfig.date = dateTimeConfig.date;
        }

        setInitialSetting(id, initialConfig);
    }, [config.PluginSettings?.Plugins, id, setInitialSetting, userTimeZone]);

    const saveSettings = useCallback((setting: DateTimeConfig) => {
        setSaveNeeded();
        onChange(id, setting);
    }, [id, onChange, setSaveNeeded]);

    const surveyTimeChangeHandler = useCallback((value: string) => {
        if (!currentUser.timezone || !userTimeZone) {
            return;
        }

        const userTime = value;

        // const userTimeZone = currentUser.timezone.useAutomaticTimezone ? currentUser.timezone.automaticTimezone : currentUser.timezone?.manualTimezone;
        const utcTime = formatInTimeZone(parse(value, 'HH:mm', new Date()), userTimeZone, 'HH:mm');

        setSurveyTime(userTime);
        setUTCSurveyTime(utcTime);
        saveSettings({date: utcSurveyDate ? format(utcSurveyDate, 'dd/MM/yyyy') : undefined, time: utcTime});
    }, [currentUser.timezone, saveSettings, userTimeZone, utcSurveyDate]);

    const surveyDateChangeHandler = useCallback((value?: Date) => {
        console.log('surveyDateChangeHandler');
        if (!currentUser.timezone || !userTimeZone) {
            return;
        }

        if (!value) {
            setSurveyDate(value);
            setUTCSurveyDate(value);
            saveSettings({date: undefined, time: surveyTime});
        } else {
            // const userTimeZone = currentUser.timezone.useAutomaticTimezone ? currentUser.timezone.automaticTimezone : currentUser.timezone?.manualTimezone;
            const utcDate = fromZonedTime(value, userTimeZone);

            setSurveyDate(value);
            setUTCSurveyDate(utcDate);
            saveSettings({date: value ? format(utcDate, 'dd/MM/yyyy') : undefined, time: utcSurveyTime});
        }
    }, [currentUser.timezone, saveSettings, surveyTime, userTimeZone, utcSurveyTime]);

    const helpText = useMemo(() => {
        if (!userTimeZone) {
            return '';
        }

        let line1 = '';
        if (surveyDateTime && surveyDate) {
            const localDateFormat = use24HourTime ? 'MMMM d, y \'at\' HH:mm O' : 'MMMM d, y \'at\' HH:mm a O';
            const utcDateFormat = use24HourTime ? 'MMMM d, y \'at\' HH:mm' : 'MMMM d, y \'at\' HH:mm a';
            line1 = `Scheduled for ${formatInTimeZone(surveyDateTime, userTimeZone, localDateFormat)} (${formatInTimeZone(surveyDateTime, 'Etc/UTC', utcDateFormat)} UTC)\n\n`;
        }

        return line1 + 'A bot message containing the survey will start being sent to all users at the selected date and time. Delivery will occur gradually, so the exact time may vary.';
    }, [surveyDate, surveyDateTime, use24HourTime, userTimeZone]);

    return (
        <div className='SurveyDateTime'>
            <div className='horizontal'>
                <SurveyDateSelector
                    value={surveyDate}
                    onChange={surveyDateChangeHandler}
                />
                <SurveyTimeSelector
                    onChange={surveyTimeChangeHandler}
                    value={utcSurveyTime}
                />
            </div>

            <div className='horizontal'>
                <p className='multiline'>{helpText}</p>
            </div>
        </div>
    );
}

export default SurveyDateTime;
