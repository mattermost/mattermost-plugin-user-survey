// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Post} from '@mattermost/types/lib/posts';

import type {QuestionType} from 'components/systemConsole/questions/questions';

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
