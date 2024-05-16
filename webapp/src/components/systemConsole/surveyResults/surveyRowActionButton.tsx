// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import client from 'client/client';
import React, {useCallback, useState} from 'react';

import Button from 'components/common/button/button';
import {ConfirmationModal} from 'components/systemConsole/surveyResults/confirmationModal';

import type {SurveyResult} from 'types/plugin';

type Props = {
    surveyResult: SurveyResult;
    onStopSurvey: (surveyID: string) => void;
}

export default function SurveyRowActionButton({surveyResult, onStopSurvey}: Props) {
    const [isDownloadingReport, setIsDownloadingReport] = useState<boolean>(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);

    const handleDownloadSurveyReport = useCallback(async (surveyID: string) => {
        setIsDownloadingReport(true);
        await client.downloadSurveyReport(surveyID);
        setIsDownloadingReport(false);
    }, []);

    const handleShowConfirmationDialog = useCallback(() => {
        setShowConfirmationModal(true);
    }, []);

    const handleHideConfirmationDialog = useCallback(() => {
        setShowConfirmationModal(false);
    }, []);

    const handleDownloadReportButtonCLick = useCallback(() => {
        handleDownloadSurveyReport(surveyResult.id);
    }, [handleDownloadSurveyReport, surveyResult.id]);

    const handleStopSurvey = useCallback(() => {
        onStopSurvey(surveyResult.id);
    }, [onStopSurvey, surveyResult.id]);

    if (surveyResult.status === 'ended') {
        return (
            <div
                key={surveyResult.id}
                className='surveyResultActions'
            >
                <Button
                    iconClass={isDownloadingReport ? 'refresh' : 'download-outline'}
                    text='Export responses'
                    onClick={handleDownloadReportButtonCLick}
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
                onClick={handleShowConfirmationDialog}
            />
            <Button
                iconClass={isDownloadingReport ? 'refresh' : 'download-outline'}
                onClick={handleDownloadReportButtonCLick}
            />

            {
                showConfirmationModal &&
                <ConfirmationModal
                    id='endSurveyConfirmationModal'
                    title='Confirm survey end'
                    bodyMessage="Are you sure you want to end this active survey? Once the survey ends, it can't be re-started, and no new responses can be collected"
                    confirmButtonText='End survey'
                    handleConfirm={handleStopSurvey}
                    handleCancel={handleHideConfirmationDialog}
                />
            }
        </div>
    );
}
