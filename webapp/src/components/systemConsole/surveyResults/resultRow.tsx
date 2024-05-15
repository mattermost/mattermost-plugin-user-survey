// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {format} from 'date-fns';
import React from 'react';

import SurveyRowActionButton from 'components/systemConsole/surveyResults/surveyRowActionButton';

import type {SurveyResult} from 'types/plugin';

type Props = {
    result: SurveyResult;
    onStopSurvey: (surveyID: string) => void;
}

export default function ResultRow({result, onStopSurvey}: Props) {
    return (
        <div
            key={result.id}
            className='horizontal surveyResultRow'
        >
            <div className='startDate'>
                <span>{format(result.startDate, 'do MMM yyyy')}</span>
                {result.status === 'in_progress' && <div className='badge inProgress'>{'Active'}</div>}
            </div>
            <div className='endDate'><span>{format(result.endDate, 'do MMM yyyy')}</span></div>
            <div className='npsScore'><span>{result.npsScore || '-'}</span></div>
            <div className='receiptsCount'><span>{result.receiptCount}</span></div>
            <div className='responseCount'><span>{result.responseCount}</span></div>
            <div className='actions'>
                <SurveyRowActionButton
                    surveyResult={result}
                    onStopSurvey={onStopSurvey}
                />
            </div>
        </div>
    );
}
