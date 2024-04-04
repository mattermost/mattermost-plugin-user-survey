// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo, useState} from 'react';

import './style.scss';
import utils from 'utils/utils';

import Button from 'components/common/button/button';
import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';

import type {SurveyResult} from 'types/mattermost-webapp';

import {parse} from 'date-fns';

function SurveyResults({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    // dummy survey respones.
    // Will be replaced by data fetched from API later on
    const dummySurveyResults = (): SurveyResult[] => {
        return [
            {
                surveyId: utils.uuid(),
                startDate: '01/01/2024',
                endDate: '31/01/2024',
                npsScore: 0,
                receiptsCount: 950,
                responseCount: 24,
                status: 'in_progress',
            },
            {
                surveyId: utils.uuid(),
                startDate: '01/10/2023',
                endDate: '30/10/2023',
                npsScore: 9.1,
                receiptsCount: 539,
                responseCount: 328,
                status: 'ended',
            },
            {
                surveyId: utils.uuid(),
                startDate: '01/07/2023',
                endDate: '5/07/2023',
                npsScore: 8.8,
                receiptsCount: 496,
                responseCount: 196,
                status: 'ended',
            },
            {
                surveyId: utils.uuid(),
                startDate: '01/01/2023',
                endDate: '31/01/2023',
                npsScore: 7.5,
                receiptsCount: 950,
                responseCount: 24,
                status: 'ended',
            },
            {
                surveyId: utils.uuid(),
                startDate: '31/01/2023',
                endDate: '20/02/2023',
                npsScore: 8.9,
                receiptsCount: 1542,
                responseCount: 1104,
                status: 'ended',
            },
        ];
    };

    const [surveyResults, setSurveyResults] = useState<SurveyResult[]>([]);

    useEffect(() => {
        const results = dummySurveyResults();
        results.sort((a, b) => {
            const aStartDate = parse(a.startDate, 'dd/MM/yyyy', new Date()).getSeconds();
            const bStartDate = parse(b.startDate, 'dd/MM/yyyy', new Date()).getSeconds();
            return aStartDate - bStartDate;
        });
        setSurveyResults(results);
    }, []);

    const generateActions = (surveyResult: SurveyResult) => {
        if (surveyResult.status === 'ended') {
            return (
                <div className='surveyResultActions'>
                    <Button
                        iconClass='icon-download-outline'
                        text='Export responses'
                    />
                </div>
            );
        }
        return (
            <div className='surveyResultActions horizontal'>
                <Button
                    type='tertiary'
                    danger={true}
                    iconClass='icon-flag-checkered'
                    text='End survey'
                />
                <Button iconClass='icon-download-outline'/>
            </div>
        );
    };

    const renderedRows = useMemo(() => {
        return surveyResults.map((result) => {
            return (
                <div
                    key={result.surveyId}
                    className='horizontal surveyResultRow'
                >
                    <div className='startDate'><span>{result.startDate}</span></div>
                    <div className='endDate'><span>{result.endDate}</span></div>
                    <div className='npsScore'><span>{result.npsScore || '-'}</span></div>
                    <div className='receiptsCount'><span>{result.receiptsCount}</span></div>
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

export default SurveyResults;
