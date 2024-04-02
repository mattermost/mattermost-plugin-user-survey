// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import './style.scss';
import {CustomComponentProps} from 'types/mattermost-webapp';
import SurveyDateTime from 'components/systemConsole/surveyDateTime/surveyDateTime';
import Expiry from 'components/systemConsole/expiry/expiry';
import TeamFilter from 'components/systemConsole/teamFilter/teamFilter';
import Questions from 'components/systemConsole/questions/questions';

function SystemConsoleSetting(props: CustomComponentProps) {
    return (
        <div className='SystemConsoleSetting vertical'>
            <div className='horizontal'>
                <div className='settingLabel'>
                    {'Send next survey at:'}
                </div>

                <div className='customSettingComponent'>
                    <SurveyDateTime {...props}/>
                </div>
            </div>

            <div className="horizontal">
                <div className="settingLabel">
                    {'Survey expiry (days):'}
                </div>
                <div className="customSettingComponent">
                    <Expiry {...props}/>
                </div>
            </div>

            <div className="horizontal">
                <div className="settingLabel">
                    {'Exclude specific teams:'}
                </div>
                <div className="customSettingComponent">
                    <TeamFilter {...props}/>
                </div>
            </div>

            <div className="horizontal">
                <div className="customSettingComponent">
                    <Questions {...props}/>
                </div>
            </div>
        </div>
    );
}

export default SystemConsoleSetting;
