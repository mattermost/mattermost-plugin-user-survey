// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Post} from '@mattermost/types/lib/posts';

import type {QuestionType} from 'components/systemConsole/questions/questions';

export type DateTimeConfig = {
    date?: string;
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

export type CombinedConfig = {
    SurveyDateTime: DateTimeConfig;
    SurveyExpiry: ExpiryConfig;
    TeamFilter: TeamFilterConfig;
    SurveyQuestions: SurveyQuestionsConfig;
};

export type CustomConfigTypes =
    DateTimeConfig
    | ExpiryConfig
    | TeamFilterConfig
    | SurveyQuestionsConfig
    | CombinedConfig;

export type SurveyStatus = 'in_progress' | 'ended';

// copied from TextFormattingOptionsBase interface located at
// https://github.com/mattermost/mattermost/blob/9ecb3e20c8d7110cad38d2a5c4a60849b729cf67/webapp/channels/src/utils/text_formatting.tsx#L56
export type FormatTextOptions = {

    /**
     * If specified, this word is highlighted in the resulting html.
     *
     * Defaults to nothing.
     */
    searchTerm: string;

    /**
     * If specified, an array of words that will be highlighted.
     *
     * If both this and `searchTerm` are specified, this takes precedence.
     *
     * Defaults to nothing.
     */
    searchMatches: string[];

    searchPatterns: SearchPattern[];

    /**
     * Specifies whether to highlight mentions of the current user.
     *
     * Defaults to `true`.
     */
    mentionHighlight: boolean;

    /**
     * Specifies whether to display group mentions as blue links.
     *
     * Defaults to `false`.
     */
    disableGroupHighlight: boolean;

    /**
     * A list of mention keys for the current user to highlight.
     */
    mentionKeys: MentionKey[];

    /**
     * A list of highlight keys for the current user to highlight without notification.
     */
    highlightKeys: HighlightWithoutNotificationKey[];

    /**
     * Specifies whether to remove newlines.
     *
     * Defaults to `false`.
     */
    singleline: boolean;

    /**
     * Enables emoticon parsing with a data-emoticon attribute.
     *
     * Defaults to `true`.
     */
    emoticons: boolean;

    /**
     * Enables markdown parsing.
     *
     * Defaults to `true`.
     */
    markdown: boolean;

    /**
     * The origin of this Mattermost instance.
     *
     * If provided, links to channels and posts will be replaced with internal
     * links that can be handled by a special click handler.
     */
    siteURL: string;

    /**
     * Whether or not to render at mentions into spans with a data-mention attribute.
     *
     * Defaults to `false`.
     */
    atMentions: boolean;

    /**
     * An object mapping channel display names to channels.
     *
     * If provided, ~channel mentions will be replaced with links to the relevant channel.
     */
    channelNamesMap: ChannelNamesMap;

    /**
     * The current team.
     */
    team: Team;

    /**
     * If specified, images are proxied.
     *
     * Defaults to `false`.
     */
    proxyImages: boolean;

    /**
     * An array of url schemes that will be allowed for autolinking.
     *
     * Defaults to autolinking with any url scheme.
     */
    autolinkedUrlSchemes: string[];

    /**
     * An array of paths on the server that are managed by another server. Any path provided will be treated as an
     * external link that will not by handled by react-router.
     *
     * Defaults to an empty array.
     */
    managedResourcePaths: string[];

    /**
     * A custom renderer object to use in the formatWithRenderer function.
     *
     * Defaults to empty.
     */
    renderer: Renderer;

    /**
     * Minimum number of characters in a hashtag.
     *
     * Defaults to `3`.
     */
    minimumHashtagLength: number;

    /**
     * the timestamp on which the post was last edited
     */
    editedAt: number;
    postId: string;

    /**
     * Whether or not to render sum of members mentions e.g. "5 members..." into spans with a data-sum-of-members-mention attribute.
     *
     * Defaults to `false`.
     */
    atSumOfMembersMentions: boolean;

    /**
     * Whether or not to render plan mentions e.g. "Professional plan, Enterprise plan, Starter plan" into spans with a data-plan-mention attribute.
     *
     * Defaults to `false`.
     */
    atPlanMentions: boolean;

    /**
     * If true, the renderer will assume links are not safe.
     *
     * Defaults to `false`.
     */
    unsafeLinks: boolean;
}

export type CustomPostTypeComponentProps = {
    post: Post;
    isRHS: boolean;
}

export type SurveyResponse = {
    response: { [key: string]: string };
    responseType?: 'partial' | 'complete';
}

export type Survey = {
    id: string;
    startTime: number;
    surveyQuestions: Question[];
    status: SurveyStatus;
    excludedTeamIDs: string[];
    duration: number;
}

export type SurveyResult = Survey & {
    receiptCount: number;
    responseCount: number;
    passiveCount: number;
    promoterCount: number;
    detractorCount: number;

    startDate: Date;
    endDate: Date;
    npsScore: number;
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
