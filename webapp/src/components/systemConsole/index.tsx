// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useState} from 'react';

import './style.scss';
import Expiry from 'components/systemConsole/expiry/expiry';
import Questions from 'components/systemConsole/questions/questions';
import SurveyDateTime from 'components/systemConsole/surveyDateTime/surveyDateTime';
import TeamFilter from 'components/systemConsole/teamFilter/teamFilter';

import type {CombinedConfig, CustomComponentProps, CustomConfigTypes} from 'types/mattermost-webapp';

function SystemConsoleSetting(props: CustomComponentProps) {
    const {id, onChange, setSaveNeeded} = props;

    const [config, setConfig] = useState<CombinedConfig>({} as CombinedConfig);

    const onChangeWrapper = useCallback((settingId: string, settings: CustomConfigTypes) => {
        console.log({settingId, settings});
        const newConfig = {
            ...config,
            [settingId]: settings,
        };

        setConfig(newConfig);
        onChange(id, newConfig);
        setSaveNeeded();
    }, [config, id, onChange, setSaveNeeded]);

    const modifiedProps = {
        ...props,
        onChange: onChangeWrapper,
    };

    return (
        <div className='SystemConsoleSetting vertical'>
            <div className='horizontal'>
                <div className='settingLabel'>
                    {'Send next survey at:'}
                </div>

                <div className='customSettingComponent'>
                    <SurveyDateTime
                        {...modifiedProps}
                        id='SurveyDateTime'
                    />
                </div>
            </div>

            <div className='horizontal'>
                <div className='settingLabel'>
                    {'Survey expiry (days):'}
                </div>
                <div className='customSettingComponent'>
                    <Expiry
                        {...modifiedProps}
                        id='SurveyExpiry'
                    />
                </div>
            </div>

            <div className='horizontal'>
                <div className='settingLabel'>
                    {'Exclude specific teams:'}
                </div>
                <div className='customSettingComponent'>
                    <TeamFilter
                        {...modifiedProps}
                        id='TeamFilter'
                    />
                </div>
            </div>

            <div className='horizontal'>
                <div className='customSettingComponent'>
                    <Questions
                        {...modifiedProps}
                        id='SurveyQuestions'
                    />
                </div>
            </div>
        </div>
    );
}

export default SystemConsoleSetting;
