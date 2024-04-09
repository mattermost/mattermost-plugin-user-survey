// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type React from 'react';

import type {Post} from '@mattermost/types/posts';

import type {AdminConfig} from 'mattermost-redux/src/types/config';

import type {Question, QuestionType} from 'components/systemConsole/questions/questions';

export type DateTimeConfig = {
    date: string;
    time: string;
}

export type ExpiryConfig = {
    days: number;
}

export type TeamFilterConfig = {
    filteredTeamIDs: string[];
}

export type SurveyQuestionsConfig = {
    surveyMessageText: string;
    questions: Question[];
};

export type SurveyEnabledConfig = boolean;

export type CombinedConfig = {
    SurveyDateTime: DateTimeConfig;
    SurveyExpiry: ExpiryConfig;
    TeamFilter: TeamFilterConfig;
    SurveyQuestions: SurveyQuestionsConfig;
    EnableSurvey: SurveyEnabledConfig;
};

export type CustomConfigTypes = DateTimeConfig | ExpiryConfig | TeamFilterConfig | SurveyQuestionsConfig | SurveyEnabledConfig | CombinedConfig;

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

export type SurveyStatus = 'in_progress' | 'ended';

export type SurveyResult = {
    surveyId: string;
    startDate: string;
    endDate: string;
    npsScore: number;
    receiptsCount: number;
    responseCount: number;
    status: SurveyStatus;
}

export type FormatTextOptions = {
    markdown?: boolean;
}

export type PostUtils = {
    formatText: (text: string, option: Partial<FormatTextOptions>) => string;
    messageHtmlToComponent: (html: string, isRHS: boolean) => React.ReactNode;
}

export type MattermostWindow = {
    PostUtils: PostUtils;
}

export type CustomPostTypeComponentProps = {
    post: Post;
    isRHS: boolean;
}

export type SurveyResponse = {
    responses: {[key: string]: unknown};
    dateCreated: string;
}

export type Survey = {
    surveyId: string;
    startDate: string;
    endDate: string;
    questions: Question[];
    status: SurveyStatus;
}

export type Question = {
    id: string;
    text?: string;
    type: QuestionType;
    system: boolean;
    mandatory: boolean;
};

export type UserSurvey = Survey & {
    response?: SurveyResponse;
}
