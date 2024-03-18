import React from 'react';

export type DateTimeConfig = {
    date: string,
    time: string,
}

export type ExpiryConfig = {
    days: number,
}

export type CustomConfigTypes = DateTimeConfig | ExpiryConfig;

export type Config = {
    PluginSettings?: {
        Plugins?: {
            'com.mattermost.user-survey'?: {
                surveydatetime: DateTimeConfig,
                surveyexpiry: ExpiryConfig,
            },
        },
    },
    [key: string]: unknown,
}

// refer here for all available values -
// https://developers.mattermost.com/integrate/plugins/best-practices/#how-can-a-plugin-define-its-own-setting-type
export type CustomComponentProps = {
    id: string
    setSaveNeeded: () => void
    onChange: (settingId: string, settings: CustomConfigTypes) => void
    config: Config
}

export interface PluginRegistry {
    registerPostTypeComponent(typeName: string, component: React.ElementType)
    registerAdminConsoleCustomSetting(key: string, component: React.FunctionComponent<CustomComponentProps>, options?: { showTitle: boolean })

    // Add more if needed from https://developers.mattermost.com/extend/plugins/webapp/reference
}
