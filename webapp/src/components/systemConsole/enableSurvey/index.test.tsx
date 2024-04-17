// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {fireEvent, render} from '@testing-library/react';
import React from 'react';

import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';

import type {CombinedConfig, Config} from 'types/mattermost-webapp';

import EnableSurvey from './index';

describe('EnableSurvey component', () => {
    it('base case', async () => {
        const config: Config = {
            PluginSettings: {
                Plugins: {
                    'com.mattermost.user-survey': {
                        systemconsolesetting: {
                            EnableSurvey: true,
                        } as CombinedConfig,
                    },
                },
            },
        } as Config;

        const props: CustomSettingChildComponentProp = {
            id: 'EnableSurvey',
            setSaveNeeded: jest.fn(),
            onChange: jest.fn(),
            setInitialSetting: jest.fn(),
            registerSaveAction: jest.fn(),
            unRegisterSaveAction: jest.fn(),
            config,
        };

        const {container} = render(<EnableSurvey {...props}/>);

        expect(props.setInitialSetting).toBeCalledWith('EnableSurvey', true);

        const disableRadioButton = container.querySelector('#enableSurvey_disabled');
        expect(disableRadioButton).toBeDefined();
        expect(disableRadioButton).not.toBeNull();
        fireEvent.click(disableRadioButton!);

        expect(props.onChange).toBeCalledWith('EnableSurvey', false);
        expect(props.setSaveNeeded).toBeCalledTimes(1);
    });
});
