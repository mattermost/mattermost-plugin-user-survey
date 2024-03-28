// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {ChangeEvent} from 'react';
import React, {useMemo, useCallback, useEffect, useState} from 'react';

import type {CustomComponentProps, ExpiryConfig} from 'types/mattermost-webapp';

import './style.scss';

const defaultExpiry = '30';

const Expiry = ({id, setSaveNeeded, onChange, config, registerSaveAction, unRegisterSaveAction}: CustomComponentProps) => {
    const [expiryDays, setExpiryDays] = useState<string>(defaultExpiry);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        // Set initial value from saved config

        const expiryConfig = config.PluginSettings?.Plugins?.['com.mattermost.user-survey']?.surveyexpiry;

        if (expiryConfig?.days) {
            setExpiryDays(expiryConfig.days.toString());
        }
    }, [config.PluginSettings?.Plugins]);

    const handleSave = useMemo(() => {
        return async () => {
            return {error: {message: error}};
        };
    }, [error]);

    useEffect(() => {
        registerSaveAction(handleSave);

        return () => {
            unRegisterSaveAction(handleSave);
        };
    }, [handleSave, registerSaveAction, unRegisterSaveAction]);

    const saveSettings = useCallback((setting: ExpiryConfig) => {
        setSaveNeeded();
        onChange(id, setting);
    }, [id, onChange, setSaveNeeded]);

    const expiryDaysChangeHandler = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setExpiryDays(e.target.value);
        setSaveNeeded();

        const numberValue = Number.parseInt(e.target.value, 10);
        if (isNaN(numberValue)) {
            console.log('error set');
            setError('Please enter a valid number larger than "1"');
        } else {
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

            <div className='horizontal'>
                <p>
                    {'Select the number of days for which the survey will stay active and users will be able to respond to it. No more responses for this survey will be accepted after the set number of days have passed. '}
                </p>
            </div>
        </div>
    );
};

export default Expiry;
