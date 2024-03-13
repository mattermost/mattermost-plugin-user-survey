import React from 'react';

// refer here for all available values -
// https://developers.mattermost.com/integrate/plugins/best-practices/#how-can-a-plugin-define-its-own-setting-type
export type CustomComponentProps = {
    id: string
    setSaveNeeded: () => void
    onChange: (settingId: string, settings: any) => void
}

export interface PluginRegistry {
    registerPostTypeComponent(typeName: string, component: React.ElementType)
    registerAdminConsoleCustomSetting(key: string, component: React.FunctionComponent<CustomComponentProps>, options?: { showTitle: boolean })

    // Add more if needed from https://developers.mattermost.com/extend/plugins/webapp/reference
}
