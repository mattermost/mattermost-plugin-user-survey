// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import client from 'client/client';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import ResultRow from 'components/systemConsole/surveyResults/resultRow';

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

    const handleStopSurvey = useCallback(async (surveyID: string) => {
        try {
            await client.endSurvey(surveyID);
        } catch (error) {
            console.error(error);
            return;
        }

        const updatedSurveyResult = [...surveyResults];
        const surveyResultIndex = updatedSurveyResult.findIndex((surveyResult) => surveyResult.id === surveyID);
        if (surveyResultIndex < 0) {
            return;
        }

        updatedSurveyResult[surveyResultIndex].status = 'ended';
        setSurveyResults(updatedSurveyResult);
    }, [surveyResults]);

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

        return surveyResults.map((result) => (
            <ResultRow
                key={result.id}
                result={result}
                onStopSurvey={handleStopSurvey}
            />
        ));
    }, [handleStopSurvey, surveyResults]);

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
