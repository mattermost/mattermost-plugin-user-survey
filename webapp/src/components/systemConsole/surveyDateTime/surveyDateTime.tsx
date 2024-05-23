// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format, parse} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import SurveyDateSelector from 'components/surveyDateSelector/surveyDateSelector';
import SurveyTimeSelector from 'components/surveyTimeSelector/surveyTimeSelector';
import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';

import type {DateTimeConfig} from 'types/plugin';

import './style.scss';

const DEFAULT_SURVEY_TIME = '00:00';

function SurveyDateTime({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    const [surveyTime, setSurveyTime] = useState<string>(DEFAULT_SURVEY_TIME);
    const [surveyDate, setSurveyDate] = useState<Date>();

    const [surveyDateTime, setSurveyDateTime] = useState<Date>();

    useEffect(() => {// Extract date components from the UTC Date object
        if (!surveyDate) {
            return;
        }

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
        };

        if (dateTimeConfig?.time) {
            setSurveyTime(dateTimeConfig.time);
            initialConfig.time = dateTimeConfig.time;
        }

        if (dateTimeConfig?.date) {
            setSurveyDate(parse(dateTimeConfig.date, 'dd/MM/yyyy', new Date()));
            initialConfig.date = dateTimeConfig.date;
        }

        setInitialSetting(id, initialConfig);
    }, [config.PluginSettings?.Plugins, id, setInitialSetting]);

    const saveSettings = useCallback((setting: DateTimeConfig) => {
        setSaveNeeded();
        onChange(id, setting);
    }, [id, onChange, setSaveNeeded]);

    const surveyTimeChangeHandler = useCallback((value: string) => {
        setSurveyTime(value);
        saveSettings({date: surveyDate ? format(surveyDate, 'dd/MM/yyyy') : undefined, time: value});
    }, [saveSettings, surveyDate]);

    const surveyDateChangeHandler = useCallback((value?: Date) => {
        setSurveyDate(value);
        saveSettings({date: value ? format(value, 'dd/MM/yyyy') : undefined, time: surveyTime});
    }, [saveSettings, surveyTime]);

    const helpText = useMemo(() => {
        let line1 = '';
        if (surveyDateTime && surveyDate) {
            line1 = `(Equivalent to local time ${format(surveyDateTime, 'H:mm MMMM d, y O')})\n\n`;
        }

        return line1 + 'A bot message containing the survey will start being sent to all users at the selected date and time. Delivery will occur gradually, so the exact time may vary.';
    }, [surveyDate, surveyDateTime]);

    return (
        <div className='SurveyDateTime'>
            <div className='horizontal'>
                <SurveyDateSelector
                    value={surveyDate}
                    onChange={surveyDateChangeHandler}
                />
                <SurveyTimeSelector
                    onChange={surveyTimeChangeHandler}
                    value={surveyTime}
                />
            </div>

            <div className='horizontal'>
                <p className='multiline'>{helpText}</p>
            </div>
        </div>
    );
}

export default SurveyDateTime;
