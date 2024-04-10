// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type React from 'react';

import type {AdminConfig} from 'mattermost-redux/src/types/config';

import type {CombinedConfig, CustomConfigTypes, FormatTextOptions} from 'types/plugin';

export type PostUtils = {
    formatText: (text: string, option: Partial<FormatTextOptions>) => string;
    messageHtmlToComponent: (html: string, isRHS: boolean) => React.ReactNode;
}

export type MattermostWindow = {
    PostUtils: PostUtils;
}

export type Config = AdminConfig & {
    PluginSettings?: {
        Plugins?: {
            'com.mattermost.user-survey'?: {
                systemconsolesetting: CombinedConfig;
            };
        };
    };
}

// refer here for all available values -
// https://developers.mattermost.com/integrate/plugins/best-practices/#how-can-a-plugin-define-its-own-setting-type
export type CustomComponentProps = {
    id: string;
    setSaveNeeded: () => void;
    onChange: (settingId: string, settings: CustomConfigTypes) => void;
    config: Config;
    registerSaveAction: (saveAction: () => Promise<unknown>) => void;
    unRegisterSaveAction: (saveAction: () => Promise<unknown>) => void;
}

export interface PluginRegistry {
    registerPostTypeComponent(typeName: string, component: React.ElementType);
    registerAdminConsoleCustomSetting(key: string, component: React.FunctionComponent<CustomComponentProps>, options?: { showTitle: boolean });

    // Add more if needed from https://developers.mattermost.com/extend/plugins/webapp/reference
}

