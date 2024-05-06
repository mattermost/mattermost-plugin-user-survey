// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import HttpClient from 'client/httpClient';
import {types} from 'sass';

import type {SurveyResponse} from 'types/plugin';

import manifest from '../manifest';

import Error = types.Error;

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
}

const Client = new SurveyClient();

export default Client;
