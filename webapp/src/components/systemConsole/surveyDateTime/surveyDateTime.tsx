// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format, parse} from 'date-fns';
import React, {useEffect, useState} from 'react';

import SurveyDateSelector from 'components/surveyDateSelector/surveyDateSelector';
import SurveyTimeSelector from 'components/surveyTimeSelector/surveyTimeSelector';

import type {CustomComponentProps} from 'types/mattermost-webapp';

import './style.scss';

const defaultSurveyTime = '09:00';

function SurveyDateTime({id, setSaveNeeded, onChange, config}: CustomComponentProps) {
    const [surveyTime, setSurveyTime] = useState<string>(defaultSurveyTime);
    const [surveyDate, setSurveyDate] = useState<Date>(new Date());

    useEffect(() => {
        // sets the date picker and time picker to the values saved in config on load

        const dateTimeConfig = config.PluginSettings?.Plugins?.['com.mattermost.user-survey']?.surveydatetime;

        if (dateTimeConfig?.time) {
            setSurveyTime(dateTimeConfig.time);
        }

        if (dateTimeConfig?.date) {
            setSurveyDate(parse(dateTimeConfig.date, 'dd/MM/yyyy', new Date()));
        } else {
            const monthFromNow = new Date();
            monthFromNow.setDate(monthFromNow.getDate() + 30);
            setSurveyDate(monthFromNow);
        }
    }, [config.PluginSettings?.Plugins]);

    // Tells MM system console that some setting(s) have changed.
    // This makes the "Save" button active and prompts the user
    // about unsaved changes when navigating away from the plugin setting page.
    // It also informs MM webapp about the settings so it can save it when user
    // clicks the "Save" button.
    useEffect(() => {
        const setting = {
            time: surveyTime,
            date: format(surveyDate, 'dd/MM/yyyy'),
        };

        setSaveNeeded();
        onChange(id, setting);
    }, [id, onChange, setSaveNeeded, surveyDate, surveyTime]);

    return (
        <div className='SurveyDateTime'>
            <div className='horizontal'>
                <SurveyTimeSelector
                    onChange={setSurveyTime}
                    value={surveyTime}
                />
                <SurveyDateSelector
                    value={surveyDate}
                    onChange={setSurveyDate}
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
