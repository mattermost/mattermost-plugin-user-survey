// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import client from 'client/client';
import {format} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import Button from 'components/common/button/button';
import Panel from 'components/common/panel/panel';
import {ConfirmationModal} from 'components/systemConsole/surveyResults/confirmationModal';

import type {SurveyResult} from 'types/plugin';

import './style.scss';

function SurveyResults() {
    const [surveyResults, setSurveyResults] = useState<SurveyResult[]>([]);
    const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
    const currentSurveyID = useRef<string>();

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

    const handleStopSurvey = useCallback(async () => {
        if (!currentSurveyID.current) {
            return;
        }

        try {
            await client.endSurvey(currentSurveyID.current);
        } catch (error) {
            console.error(error);
            return;
        }

        const updatedSurveyResult = [...surveyResults];
        const surveyResultIndex = updatedSurveyResult.findIndex((surveyResult) => surveyResult.id === currentSurveyID.current);
        if (surveyResultIndex < 0) {
            return;
        }

        updatedSurveyResult[surveyResultIndex].status = 'ended';
        setSurveyResults(updatedSurveyResult);
    }, [surveyResults]);

    const handleShowConfirmationDialog = useCallback((surveyID: string) => {
        currentSurveyID.current = surveyID;
        setShowConfirmationModal(true);
    }, []);

    const handleHideConfirmationDialog = useCallback(() => {
        currentSurveyID.current = undefined;
        setShowConfirmationModal(false);
    }, []);

    const generateActions = useCallback((surveyResult: SurveyResult) => {
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
                    iconClass='flag-checkered'
                    text='End survey'
                    onClick={() => handleShowConfirmationDialog(surveyResult.id)}
                />
                <Button iconClass='download-outline'/>
            </div>
        );
    }, [handleShowConfirmationDialog]);

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
                        {result.status === 'in_progress' && <div className='badge inProgress'>{'Active'}</div>}
                    </div>
                    <div className='endDate'><span>{format(result.endDate, 'do MMM yyyy')}</span></div>
                    <div className='npsScore'><span>{result.npsScore || '-'}</span></div>
                    <div className='receiptsCount'><span>{result.receiptCount}</span></div>
                    <div className='responseCount'><span>{result.responseCount}</span></div>
                    <div className='actions'>{generateActions(result)}</div>
                </div>
            );
        });
    }, [generateActions, surveyResults]);

    return (
        <React.Fragment>
            <Panel
                className='SurveyResults'
                title='Active and past surveys'
                subTitle='Track and download responses for active and previously conducted surveys'
                collapsible={false}
            >
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
            </Panel>

            {
                showConfirmationModal &&
                <ConfirmationModal
                    id='endSurveyConfirmationModal'
                    title='Are you sure you want to end this survey?'
                    bodyMessage='Reprehenderit aute laborum anim dolore magna mollit incididunt officia qui labore. Esse culpa ipsum ut esse fugiat do tempor duis mollit. Labore nisi nisi ut aliquip enim aute ex. Esse veniam proident id dolor laborum occaecat voluptate esse laborum cupidatat aliquip ut laborum id. Laborum nostrud officia excepteur. Consectetur ad nisi ullamco est cillum proident Lorem. Aliqua eu est magna deserunt est elit elit do.'
                    confirmButtonText='End active survey'
                    handleConfirm={handleStopSurvey}
                    handleCancel={handleHideConfirmationDialog}
                />
            }
        </React.Fragment>
    );
}

const calculateNPS = (promoters: number, passives: number, detractors: number): number => {
    const totalResponses = promoters + passives + detractors;

    const promoterPercentage = (promoters / totalResponses) * 100;
    const detractorPercentage = (detractors / totalResponses) * 100;

    return Math.round(promoterPercentage - detractorPercentage);
};

export default SurveyResults;
