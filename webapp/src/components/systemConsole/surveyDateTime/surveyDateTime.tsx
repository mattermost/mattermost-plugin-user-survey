// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format, parse} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import SurveyDateSelector from 'components/surveyDateSelector/surveyDateSelector';
import SurveyTimeSelector from 'components/surveyTimeSelector/surveyTimeSelector';
import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';

import type {DateTimeConfig} from 'types/mattermost-webapp';

import './style.scss';

function SurveyDateTime({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    // Default settings
    const defaultSurveyTime = '09:00';
    const defaultSurveyDate = useMemo(() => new Date(), []); // useMemo as new Date() is different in every render cycle

    const [surveyTime, setSurveyTime] = useState<string>(defaultSurveyTime);
    const [surveyDate, setSurveyDate] = useState<Date>(defaultSurveyDate);

    // sets the date picker and time picker to the values saved in config on load
    useEffect(() => {
        const dateTimeConfig = config.PluginSettings?.Plugins?.['com.mattermost.user-survey']?.systemconsolesetting.SurveyDateTime;

        const initialConfig: DateTimeConfig = {
            time: defaultSurveyTime,
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
                    {`A bot message with the survey will be sent to all users at ${surveyTime} UTC on ${format(surveyDate, 'do MMM yyyy')}.`}
                </p>
            </div>
        </div>
    );
}

export default SurveyDateTime;
