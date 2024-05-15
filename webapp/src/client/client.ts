// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import HttpClient from 'client/httpClient';
import {format} from 'date-fns';

import type {SurveyResponse} from 'types/plugin';

import manifest from '../manifest';

export const ID_PATH_PATTERN = /[a-z0-9]{26}/;

class SurveyClient extends HttpClient {
    url = '';

    setServerRoute(url: string) {
        this.url = `${url}/plugins/${manifest.id}/api/v1`;
    }

    doConnected = async () => {
        return this.doPost(`${this.url}/connected`);
    };

    submitSurveyResponse = async (surveyID: string, response: SurveyResponse) => {
        if (!surveyID || !ID_PATH_PATTERN.test(surveyID)) {
            return Promise.reject(new Error('invalid survey ID encountered. Survey ID should be a 26 character, lowercase alphanumeric string'));
        }

        const url = `${this.url}/survey/${surveyID}/response`;
        return this.doPost(url, response);
    };

    getSurveyResults = async () => {
        return this.doGet(`${this.url}/survey_stats`);
    };

    endSurvey = async (surveyID: string) => {
        if (!surveyID || !ID_PATH_PATTERN.test(surveyID)) {
            return Promise.reject(new Error('invalid survey ID encountered. Survey ID should be a 26 character, lowercase alphanumeric string'));
        }

        return this.doPost(`${this.url}/survey/${surveyID}/end`);
    };

    downloadSurveyReport = async (surveyID: string) => {
        if (!surveyID || !ID_PATH_PATTERN.test(surveyID)) {
            return Promise.reject(new Error('invalid survey ID encountered. Survey ID should be a 26 character, lowercase alphanumeric string'));
        }

        const url = `${this.url}/survey/${surveyID}/report`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {'Content-Type': 'application/zip'},
        });

        const blob = await response.blob();
        const href = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.setAttribute('download', this.extractFilename(response.headers.get('content-disposition'), 'survey_report'));
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return Promise.resolve();
    };

    // copied from extractFilename function from CommercialSupportModal component in Mattermost webapp
    extractFilename = (input: string | null, defaultName?: string): string => {
        const regex = /filename\*?=["']?((?:\\.|[^"'\s])+)(?=["']?)/g;
        const matches = regex.exec(input!);

        const originalFileName = matches ? matches[1] : defaultName;

        // construct the expected filename in case of an error in the header
        const formattedDate = format(new Date(), 'yyyy-MMM-dd_hh-mm');
        return `${formattedDate}_${originalFileName}`;
    };
}

const Client = new SurveyClient();

export default Client;
