// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import type {ChangeEvent} from 'react';
import React, {useCallback, useEffect, useState} from 'react';

import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';

import type {ExpiryConfig} from 'types/plugin';

import './style.scss';

const DEFAULT_SURVEY_EXPIRY = '30';

const Expiry = ({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) => {
    const [expiryDays, setExpiryDays] = useState<string>(DEFAULT_SURVEY_EXPIRY);
    const [error, setError] = useState<string>('');

    // Set initial value from saved config
    useEffect(() => {
        const expiryConfig = config.PluginSettings?.Plugins?.['com.mattermost.user-survey']?.systemconsolesetting?.SurveyExpiry;

        const initialSetting: ExpiryConfig = {
            days: Number.parseInt(DEFAULT_SURVEY_EXPIRY, 10),
        };

        if (expiryConfig?.days) {
            setExpiryDays(expiryConfig.days.toString());
            initialSetting.days = expiryConfig.days;
        }

        setInitialSetting(id, initialSetting);
    }, [config.PluginSettings?.Plugins, id, setInitialSetting]);

    const saveSettings = useCallback((setting: ExpiryConfig) => {
        setSaveNeeded();
        onChange(id, setting);
    }, [id, onChange, setSaveNeeded]);

    const expiryDaysChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setExpiryDays(e.target.value);
        setSaveNeeded();

        const numberValue = Number.parseInt(e.target.value, 10);
        if (isNaN(numberValue) || numberValue < 1) {
            setError('Please enter a valid number');
        } else {
            setError('');
            saveSettings({days: numberValue});
        }
    }, [saveSettings, setSaveNeeded]);

    return (
        <div className='Expiry'>
            <div className='horizontal'>
                <input
                    type='number'
                    className={classNames('form-control', 'surveyExpiry', {error})}
                    name='surveyExpiry'
                    value={expiryDays}
                    onChange={expiryDaysChangeHandler}
                />
            </div>

            <div className='vertical'>
                {
                    error &&
                    <p className='errorMessage'>
                        {error}
                    </p>
                }
                <p>
                    {'Specify the number of days the survey will be open to responses. Responses to the survey won\'t be accepted after the configured number of days have passed.'}
                </p>
            </div>
        </div>
    );
};

export default Expiry;
