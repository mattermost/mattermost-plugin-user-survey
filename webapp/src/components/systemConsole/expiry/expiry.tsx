// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {CustomComponentProps} from 'types/mattermost-webapp';

import './style.scss';

const defaultExpiry = 30;

const Expiry = ({}: CustomComponentProps) => {
    return (
        <div className='Expiry'>
            <div className='row'>
                <input
                    className='form-control'
                    name='surveyExpiry'
                    defaultValue={defaultExpiry}
                />
            </div>
        </div>
    );
};

export default Expiry;
