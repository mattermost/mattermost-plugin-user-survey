// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import HttpClient from 'client/httpClient';

import manifest from '../manifest';

class SurveyClient extends HttpClient {
    url = '';

    setServerRoute(url: string) {
        this.url = `${url}/plugins/${manifest.id}/api/v1`;
    }

    doConnected = async () => {
        return this.doPost(`${this.url}/connected`);
    };
}

const Client = new SurveyClient();

export default Client;
