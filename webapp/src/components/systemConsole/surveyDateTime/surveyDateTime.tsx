// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format} from 'date-fns';
import {formatInTimeZone} from 'date-fns-tz';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import utils from 'utils/utils';

import SurveyDateSelector from 'components/surveyDateSelector/surveyDateSelector';
import SurveyTimeSelector from 'components/surveyTimeSelector/surveyTimeSelector';
import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';

import './style.scss';
import type {DateTimeConfig} from 'types/plugin';

function SurveyDateTime({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    const [surveyDate, setSurveyDate] = useState<Date>();

    // sets the date picker and time picker to the values saved in config on load
    useEffect(() => {
        const dateTimeConfig = config.PluginSettings.Plugins['com.mattermost.user-survey']?.systemconsolesetting?.SurveyDateTime;

        if (dateTimeConfig?.timestamp) {
            setSurveyDate(utils.unixTimestampToDate(dateTimeConfig.timestamp));
        }

        setInitialSetting(id, {timestamp: dateTimeConfig?.timestamp});
    }, [config.PluginSettings.Plugins, id, setInitialSetting]);

    const helpText = useMemo(() => {
        let line1;

        if (surveyDate) {
            const localDateString = format(surveyDate, "MMMM d, yyy 'at' HH:mm O");
            const utcDateString = formatInTimeZone(surveyDate, 'UTC', "MMMM d, yyy 'at' HH:mm 'UTC'");

            line1 = (<p>{`Scheduled for ${localDateString} (${utcDateString})\n\n`}</p>);
        }

        const line2 = (<p>{'A bot message containing the survey will start being sent to all users at the selected date and time. Delivery will occur gradually, so the exact time may vary.'}</p>);

        return (
            <React.Fragment>
                {line1}
                {line2}
            </React.Fragment>
        );
    }, [surveyDate]);

    const saveSettings = useCallback((setting: DateTimeConfig) => {
        setSaveNeeded();
        onChange(id, setting);
    }, [id, onChange, setSaveNeeded]);

    const surveyDateChangeHandler = useCallback((date?: Date) => {
        setSurveyDate(date);
        saveSettings({timestamp: date ? utils.dateToUnixTimestamp(date) : 0});
    }, [saveSettings]);

    const surveyTimeChangeHandler = useCallback((dateTime: Date) => {
        setSurveyDate(dateTime);
        saveSettings({timestamp: utils.dateToUnixTimestamp(dateTime)});
    }, [saveSettings]);

    return (
        <div className='SurveyDateTime'>
            <div className='horizontal'>
                <SurveyDateSelector
                    value={surveyDate}
                    onChange={surveyDateChangeHandler}
                />
                <SurveyTimeSelector
                    value={surveyDate}
                    onChange={surveyTimeChangeHandler}
                />
            </div>

            <div className='horizontal'>
                <p className='multiline'>{helpText}</p>
            </div>
        </div>
    );
}

export default SurveyDateTime;
