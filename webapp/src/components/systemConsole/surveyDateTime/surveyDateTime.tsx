// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {format, parse} from 'date-fns';

import SurveyTimeSelector from 'components/surveyTimeSelector/surveyTimeSelector';
import SurveyDateSelector from 'components/surveyDateSelector/surveyDateSelector';
import {CustomComponentProps, DateTimeConfig} from 'types/mattermost-webapp';

import './style.scss';

const defaultSurveyTime = '09:00';

// date 30 days from today
const defaultSurveyDate = new Date(new Date().setDate((new Date()).getDate() + 30));

function SurveyDateTime({id, setSaveNeeded, onChange, config}: CustomComponentProps) {
    const [surveyTime, setSurveyTime] = useState<string>(defaultSurveyTime);
    const [surveyDate, setSurveyDate] = useState<Date>(defaultSurveyDate);

    useEffect(() => {
        // sets the date picker and time picker to the values saved in config on load

        const dateTimeConfig = config.PluginSettings?.Plugins?.['com.mattermost.user-survey']?.surveydatetime;

        if (dateTimeConfig?.time) {
            setSurveyTime(dateTimeConfig.time);
        }

        if (dateTimeConfig?.date) {
            setSurveyDate(parse(dateTimeConfig.date, 'dd/MM/yyyy', new Date()));
        }
    }, [config.PluginSettings, config.PluginSettings?.Plugins]);

    // Tells MM system console that some setting(s) have changed.
    // This makes the "Save" button active and prompts the user
    // about unsaved changes when navigating away from the plugin setting page.
    // It also informs MM webapp about the settings so it can save it when user
    // clicks the "Save" button.
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
            <div className='row'>
                <SurveyTimeSelector
                    onChange={surveyTimeChangeHandler}
                    value={surveyTime}
                />
                <SurveyDateSelector
                    value={surveyDate}
                    onChange={surveyDateChangeHandler}
                />
            </div>

            <div className='row'>
                <p>
                    {`A bot message with the survey will be sent to all users at ${surveyTime} UTC on ${format(surveyDate, 'do MMM yyyy')}.`}
                </p>
            </div>
        </div>
    );
}

export default SurveyDateTime;
