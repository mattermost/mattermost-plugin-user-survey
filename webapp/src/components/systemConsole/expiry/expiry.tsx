// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {ChangeEvent, useCallback, useEffect, useState} from 'react';

import {CustomComponentProps, ExpiryConfig} from 'types/mattermost-webapp';

import './style.scss';

const defaultExpiry = 30;

const Expiry = ({id, setSaveNeeded, onChange, config}: CustomComponentProps) => {
    const [expiryDays, setExpiryDays] = useState<number>(defaultExpiry);

    useEffect(() => {
        // Set initial value from saved config

        const expiryConfig = config.PluginSettings?.Plugins?.['com.mattermost.user-survey']?.surveyexpiry;

        if (expiryConfig?.days) {
            setExpiryDays(expiryConfig.days);
        }
    }, [config.PluginSettings?.Plugins]);

    const saveSettings = useCallback((setting: ExpiryConfig) => {
        setSaveNeeded();
        onChange(id, setting);
    }, [id, onChange, setSaveNeeded]);

    const expiryDaysChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const numberValue = Number.parseInt(e.target.value, 10);
        setExpiryDays(numberValue);
        saveSettings({days: numberValue});
    }, [saveSettings]);

    return (
        <div className='Expiry'>
            <div className='row'>
                <input
                    className='form-control surveyExpiry'
                    name='surveyExpiry'
                    value={expiryDays}
                    onChange={expiryDaysChangeHandler}
                />
            </div>

            <div className='row'>
                <p>
                    {'Select the number of days for which the survey will stay active and users will be able to respond to it. No more responses for this survey will be accepted after the set number of days have passed. '}
                </p>
            </div>
        </div>
    );
};

export default Expiry;
