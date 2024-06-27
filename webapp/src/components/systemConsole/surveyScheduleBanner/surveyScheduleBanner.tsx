// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format} from 'date-fns';
import React, {useMemo} from 'react';

import './style.scss';

import Badge from 'components/common/badge/badge';

import type {DateTimeConfig, ExpiryConfig, SurveyQuestionsConfig} from 'types/plugin';

type Props = {
    dateTimeConfig: DateTimeConfig;
    expiryConfig: ExpiryConfig;
    surveyQuestionsConfig: SurveyQuestionsConfig;
}

export default function SurveyScheduleBanner({dateTimeConfig, expiryConfig, surveyQuestionsConfig}: Props) {
    const subTitleText = useMemo(() => {
        if (!dateTimeConfig.timestamp || !expiryConfig.days || !surveyQuestionsConfig.questions) {
            return '';
        }

        const messages: string[] = [];

        const startDate = new Date(dateTimeConfig.timestamp * 1000);
        messages.push(`Next survey scheduled for ${format(startDate, "HH:mm O 'on' MMMM d, yyyy")}`);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + expiryConfig.days);

        // this is to handle the case of end date going out of bounds
        if (!isNaN(endDate.getTime())) {
            messages.push(`Expires on ${format(endDate, 'MMMM d, yyyy')}`);
        }

        messages.push(`${surveyQuestionsConfig.questions.filter((question) => question.text !== '').length} questions`);

        return (messages.join(' • '));
    }, [dateTimeConfig.timestamp, expiryConfig.days, surveyQuestionsConfig.questions]);

    if (!dateTimeConfig.timestamp) {
        return null;
    }

    return (
        <div className='SurveyScheduleBanner vertical'>
            <div className='horizontal title'>
                <h5>{'Survey setup'}</h5>
                <Badge
                    text='Scheduled'
                    className='scheduledBadge'
                />
            </div>

            <span>{subTitleText}</span>
        </div>
    );
}
