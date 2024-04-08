// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ChangeEvent} from 'react';
import React, {useCallback, useEffect, useState} from 'react';

import type {CustomComponentProps, ExpiryConfig} from 'types/mattermost-webapp';

import './style.scss';

const defaultExpiry = '30';

const Expiry = ({id, setSaveNeeded, onChange, config}: CustomComponentProps) => {
    const [expiryDays, setExpiryDays] = useState<string>(defaultExpiry);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        // Set initial value from saved config

        const expiryConfig = config.PluginSettings?.Plugins?.['com.mattermost.user-survey']?.surveyexpiry;

        if (expiryConfig?.days) {
            setExpiryDays(expiryConfig.days.toString());
        }
    }, [config.PluginSettings?.Plugins]);

    const saveSettings = useCallback((setting: ExpiryConfig) => {
        setSaveNeeded();
        onChange(id, setting);
    }, [id, onChange, setSaveNeeded]);

    const expiryDaysChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setExpiryDays(e.target.value);
        setSaveNeeded();

        const numberValue = Number.parseInt(e.target.value, 10);
        if (isNaN(numberValue)) {
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
                    className='form-control surveyExpiry'
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
                    {'Select the number of days for which the survey will stay active and users will be able to respond to it. No more responses for this survey will be accepted after the set number of days have passed. '}
                </p>
            </div>
        </div>
    );
};

export default Expiry;
