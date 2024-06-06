// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format, parse} from 'date-fns';
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
        if (!dateTimeConfig.date) {
            return '';
        }

        console.log(dateTimeConfig);

        const messages: string[] = [];

        // June 3, 2024 at 11:30 PM UTC

        const startDate = parse(dateTimeConfig.date, 'dd/MM/yyyy', new Date());
        messages.push(`Next survey scheduled for ${format(startDate, 'MMMM d, y')} at ${dateTimeConfig.time} UTC`);

        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + expiryConfig.days);

        // this is to handle the case of end date going out of bounds
        if (!isNaN(endDate.getTime())) {
            messages.push(`Expires on ${format(endDate, 'MMMM d, y')}`);
        }

        messages.push(`${surveyQuestionsConfig.questions.filter((question) => question.text !== '').length} questions`);

        return (messages.join(' • '));
    }, [dateTimeConfig.date, dateTimeConfig.time, expiryConfig.days, surveyQuestionsConfig.questions]);

    if (!dateTimeConfig.date) {
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
