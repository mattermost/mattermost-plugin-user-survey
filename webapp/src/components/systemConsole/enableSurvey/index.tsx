// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';

import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';

import './style.scss';

function EnableSurvey({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    const defaultValue = false;

    const [enabled, setEnabled] = useState<boolean>(defaultValue);

    useEffect(() => {
        const enabledSurveyConfig = config.PluginSettings.Plugins['com.mattermost.user-survey']?.systemconsolesetting.EnableSurvey;

        const initialValue = enabledSurveyConfig || defaultValue;
        setEnabled(initialValue);
        setInitialSetting(id, initialValue);
    }, [config.PluginSettings.Plugins, defaultValue, id, setInitialSetting]);

    const optionOnChangeHandler = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.name === 'surveyEnabled';
        setEnabled(value);
        onChange(id, value);
        setSaveNeeded();
    }, [id, onChange, setSaveNeeded]);

    return (
        <div className='EnableSurvey horizontal'>
            <div className='option horizontal'>
                <input
                    type='radio'
                    name='surveyEnabled'
                    id='enableSurvey_enabled'
                    checked={enabled}
                    onChange={optionOnChangeHandler}
                />
                <label htmlFor='enableSurvey_enabled'>{'Enabled'}</label>
            </div>

            <div className='option horizontal'>
                <input
                    type='radio'
                    name='surveyDisabled'
                    id='enableSurvey_disabled'
                    checked={!enabled}
                    onChange={optionOnChangeHandler}
                />
                <label htmlFor='enableSurvey_disabled'>{'Disabled'}</label>
            </div>
        </div>
    );
}

export default EnableSurvey;
