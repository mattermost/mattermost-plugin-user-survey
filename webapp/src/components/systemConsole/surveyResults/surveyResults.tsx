// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import client from 'client/client';
import {format} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import Button from 'components/common/button/button';

import type {SurveyResult} from 'types/plugin';

import './style.scss';

function SurveyResults() {
    const [surveyResults, setSurveyResults] = useState<SurveyResult[]>([]);

    const hydrateSurveyResults = useCallback((surveyResults: SurveyResult[]) => {
        surveyResults.forEach((surveyResult) => {
            surveyResult.startDate = new Date(surveyResult.startTime);

            surveyResult.endDate = new Date(surveyResult.startTime);
            surveyResult.endDate.setDate(surveyResult.endDate.getDate() + surveyResult.duration);

            surveyResult.npsScore = calculateNPS(surveyResult.promoterCount, surveyResult.passiveCount, surveyResult.detractorCount);
        });
    }, []);

    useEffect(() => {
        const fetchSurveyStatus = async () => {
            const results = await client.getSurveyResults() as SurveyResult[];
            hydrateSurveyResults(results);
            setSurveyResults(results);
        };

        fetchSurveyStatus();
    }, [hydrateSurveyResults]);

    const generateActions = (surveyResult: SurveyResult) => {
        if (surveyResult.status === 'ended') {
            return (
                <div
                    key={surveyResult.id}
                    className='surveyResultActions'
                >
                    <Button
                        iconClass='icon-download-outline'
                        text='Export responses'
                    />
                </div>
            );
        }
        return (
            <div
                key={surveyResult.id}
                className='surveyResultActions horizontal'
            >
                <Button
                    buttonType='tertiary'
                    danger={true}
                    iconClass='icon-flag-checkered'
                    text='End survey'
                />
                <Button iconClass='icon-download-outline'/>
            </div>
        );
    };

    const renderedRows = useMemo(() => {
        if (surveyResults.length === 0) {
            return (
                <div
                    key='no-results'
                    className='noSurveyResults surveyResultRow'
                >
                    <p>{'No survey results yet'}</p>
                    <p>{'Results will appear here once a survey starts'}</p>
                </div>
            );
        }

        return surveyResults.map((result) => {
            return (
                <div
                    key={result.id}
                    className='horizontal surveyResultRow'
                >
                    <div className='startDate'>
                        <span>{format(result.startDate, 'do MMM yyyy')}</span>
                        {result.status === 'in_progress' && <div className='badge inProgress'>{'Active'}</div> }
                    </div>
                    <div className='endDate'><span>{format(result.endDate, 'do MMM yyyy')}</span></div>
                    <div className='npsScore'><span>{result.npsScore || '-'}</span></div>
                    <div className='receiptsCount'><span>{result.receiptCount}</span></div>
                    <div className='responseCount'><span>{result.responseCount}</span></div>
                    <div className='actions'>{generateActions(result)}</div>
                </div>
            );
        });
    }, [surveyResults]);

    return (
        <div className='SurveyResults'>
            <div className='panelHeader'>
                <h5>{'Previous surveys'}</h5>
                <p>{'Surveys sent out in the past'}</p>
            </div>

            <div className='panelBody vertical'>
                <div className='horizontal resultHeader'>
                    <div className='startDate'>{'Start date (UTC)'}</div>
                    <div className='endDate'>{'End date (UTC)'}</div>
                    <div className='npsScore'>{'NPS Score'}</div>
                    <div className='receiptsCount'>{'Sent to'}</div>
                    <div className='responseCount'>{'Responses'}</div>
                    <div className='actions'>{''}</div>
                </div>
                <div className='resultBody'>
                    {renderedRows}
                </div>
            </div>

        </div>
    );
}

const calculateNPS = (promoters: number, passives: number, detractors: number): number => {
    const totalResponses = promoters + passives + detractors;

    const promoterPercentage = (promoters / totalResponses) * 100;
    const detractorPercentage = (detractors / totalResponses) * 100;

    return Math.round(promoterPercentage - detractorPercentage);
};

export default SurveyResults;
