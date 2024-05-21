// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';

import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';

import './style.scss';

const DEFAULT_ENABLE_SURVEY = false;

function EnableSurvey({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    const [enabled, setEnabled] = useState<boolean>(DEFAULT_ENABLE_SURVEY);

    useEffect(() => {
        const enabledSurveyConfig = config.PluginSettings.Plugins['com.mattermost.user-survey']?.systemconsolesetting.EnableSurvey;

        const initialValue = enabledSurveyConfig || DEFAULT_ENABLE_SURVEY;
        setEnabled(initialValue);
        setInitialSetting(id, initialValue);
    }, [config.PluginSettings.Plugins, id, setInitialSetting]);

    const optionOnChangeHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.name === 'surveyEnabled';
        setEnabled(value);
        onChange(id, value);
        setSaveNeeded();
    }, [id, onChange, setSaveNeeded]);

    return (
        <div className='enable_survey_wrapper'>
            <div className='EnableSurvey horizontal'>
                <div className='option horizontal'>
                    <input
                        type='radio'
                        name='surveyEnabled'
                        id='enableSurvey_enabled'
                        checked={enabled}
                        onChange={optionOnChangeHandler}
                    />
                    <label htmlFor='enableSurvey_enabled'>{'true'}</label>
                </div>

                <div className='option horizontal'>
                    <input
                        type='radio'
                        name='surveyDisabled'
                        id='enableSurvey_disabled'
                        checked={!enabled}
                        onChange={optionOnChangeHandler}
                    />
                    <label htmlFor='enableSurvey_disabled'>{'false'}</label>
                </div>
            </div>
        </div>
    );
}

export default EnableSurvey;
