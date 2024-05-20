// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format, parse} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import SurveyDateSelector from 'components/surveyDateSelector/surveyDateSelector';
import SurveyTimeSelector from 'components/surveyTimeSelector/surveyTimeSelector';
import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';

import type {DateTimeConfig} from 'types/plugin';

import './style.scss';

const DEFAULT_SURVEY_TIME = '09:00';

function SurveyDateTime({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    // This default setting it here instead of outside the component like other defaults
    // is because we want the default to be the time admin opens the plugin config page.
    // If this was outside, the value would be when the admin first opened mattermost, which can
    // create quite a difference. And also because this need memomization as new Date() is a new
    // useMemo as new Date() is different in every render cycle
    const defaultSurveyDate = useMemo(() => new Date(), []);

    const [surveyTime, setSurveyTime] = useState<string>(DEFAULT_SURVEY_TIME);
    const [surveyDate, setSurveyDate] = useState<Date>(defaultSurveyDate);

    const [surveyDateTime, setSurveyDateTime] = useState<Date>(new Date());

    useEffect(() => {// Extract date components from the UTC Date object
        const year = surveyDate.getFullYear();
        const month = surveyDate.getMonth(); // getUTCMonth() returns month index (0-11)
        const day = surveyDate.getDate();

        // Parse time components from timeString
        const [hours, minutes] = surveyTime.split(':').map(Number);

        // Construct a new Date object in UTC with the combined date and time
        // Convert the UTC Date object to the user's local time zone
        setSurveyDateTime(new Date(Date.UTC(year, month, day, hours, minutes)));
    }, [surveyDate, surveyTime]);

    // sets the date picker and time picker to the values saved in config on load
    useEffect(() => {
        const dateTimeConfig = config.PluginSettings?.Plugins?.['com.mattermost.user-survey']?.systemconsolesetting.SurveyDateTime;

        const initialConfig: DateTimeConfig = {
            time: DEFAULT_SURVEY_TIME,
            date: format(defaultSurveyDate, 'dd/MM/yyyy'),
        };

        if (dateTimeConfig?.time) {
            setSurveyTime(dateTimeConfig.time);
            initialConfig.time = dateTimeConfig.time;
        }

        if (dateTimeConfig?.date) {
            setSurveyDate(parse(dateTimeConfig.date, 'dd/MM/yyyy', new Date()));
            initialConfig.date = dateTimeConfig.date;
        } else {
            const monthFromNow = new Date();
            monthFromNow.setDate(monthFromNow.getDate() + 30);
            setSurveyDate(monthFromNow);
            initialConfig.date = format(monthFromNow, 'dd/MM/yyyy');
        }

        setInitialSetting(id, initialConfig);
    }, [config.PluginSettings?.Plugins, defaultSurveyDate, id, setInitialSetting]);

    const saveSettings = useCallback((setting: DateTimeConfig) => {
        setSaveNeeded();
        onChange(id, setting);
    }, [id, onChange, setSaveNeeded]);

    const surveyTimeChangeHandler = useCallback((value: string) => {
        setSurveyTime(value);
        saveSettings({date: format(surveyDate, 'dd/MM/yyyy'), time: value});
    }, [saveSettings, surveyDate]);

    const surveyDateChangeHandler = useCallback((value: Date) => {
        setSurveyDate(value);
        saveSettings({date: format(value, 'dd/MM/yyyy'), time: surveyTime});
    }, [saveSettings, surveyTime]);

    return (
        <div className='SurveyDateTime'>
            <div className='horizontal'>
                <SurveyTimeSelector
                    onChange={surveyTimeChangeHandler}
                    value={surveyTime}
                />
                <SurveyDateSelector
                    value={surveyDate}
                    onChange={surveyDateChangeHandler}
                />
            </div>

            <div className='horizontal'>
                <p>
                    {`A bot message containing the survey will start being sent to all users at ${surveyTime} UTC on ${format(surveyDate, 'MMMM d, y')} (equivalent to ${format(surveyDateTime, 'H:mm MMMM d, y O')}). Delivery will occur gradually, so the exact time may vary.`}
                </p>
            </div>
        </div>
    );
}

export default SurveyDateTime;
