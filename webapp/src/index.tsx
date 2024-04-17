// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Store, Action} from 'redux';

import type {GlobalState} from 'mattermost-redux/types/store';

import SurveyPost from 'components/surveyPost/surveyPost';
import SystemConsoleSetting from 'components/systemConsole';

import type {PluginRegistry} from 'types/mattermost-webapp';

import manifest from './manifest';

export default class Plugin {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
    public async initialize(registry: PluginRegistry, store: Store<GlobalState, Action<Record<string, unknown>>>) {
        registry.registerAdminConsoleCustomSetting('SystemConsoleSetting', SystemConsoleSetting, {showTitle: false});
        registry.registerPostTypeComponent('custom_user_survey', SurveyPost);
    }
}

declare global {
    interface Window {
        registerPlugin(pluginId: string, plugin: Plugin): void;
    }
}

window.registerPlugin(manifest.id, new Plugin());
