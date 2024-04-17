// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {render} from '@testing-library/react';
import React from 'react';

import type {CombinedConfig, Config, CustomComponentProps} from 'types/mattermost-webapp';

import SystemConsoleSetting from './index';

describe('Main system console setting', () => {
    it('base case', () => {
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

        const props: CustomComponentProps = {
            id: 'SystemConsoleSetting',
            setSaveNeeded: jest.fn(),
            onChange: jest.fn(),
            registerSaveAction: jest.fn(),
            unRegisterSaveAction: jest.fn(),
            config,
        };

        const {container} = render(<SystemConsoleSetting {...props}/>);
        expect(container).toMatchSnapshot();
    });
});
