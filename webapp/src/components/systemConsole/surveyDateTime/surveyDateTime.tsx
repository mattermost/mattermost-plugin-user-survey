// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo, useState} from 'react';

import SurveyTimeSelector from 'components/surveyTimeSelector/surveyTimeSelector';
import SurveyDateSelector from 'components/surveyDateSelector/surveyDateSelector';

import {CustomComponentProps} from 'types/mattermost-webapp';

import './style.scss';
import {format} from 'date-fns';

const defaultSurveyTime = '09:00';

// date 30 days from today
const defaultSurveyDate = new Date(new Date().setDate((new Date()).getDate() + 30));

function SurveyDateTime({id, setSaveNeeded, onChange}: CustomComponentProps) {
    const [surveyTime, setSurveyTime] = useState<string>(defaultSurveyTime);
    const [surveyDate, setSurveyDate] = useState<Date>(defaultSurveyDate);

    const getSettingJSON = () => {
        return {
            surveyDateTime: {
                time: surveyTime,
                date: format(surveyDate, 'dd/MM/yyyy'),
            },
        };
    };

    const registerSettingChange = useCallback(() => {
        setSaveNeeded();
        onChange(id, getSettingJSON());
    }, [getSettingJSON, id, onChange]);

    const surveyTimeChangeHandler = useCallback((value: string) => {
        setSurveyTime(value);
        registerSettingChange();
    }, [registerSettingChange]);

    const surveyDateChangeHandler = useCallback((value: Date) => {
        setSurveyDate(value);
        registerSettingChange();
    }, []);

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
                    {'A bot message with the survey will be sent to all users at 09:00 UTC on 01/03/2024. The most recent survey was sent at 09:00 UTC on 01/01/2024.'}
                </p>
            </div>
        </div>
    );
}

export default SurveyDateTime;
