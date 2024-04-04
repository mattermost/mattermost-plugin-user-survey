// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo, useState} from 'react';

import './style.scss';
import EnableSurvey from 'components/systemConsole/enableSurvey';
import Expiry from 'components/systemConsole/expiry/expiry';
import Questions from 'components/systemConsole/questions/questions';
import SurveyDateTime from 'components/systemConsole/surveyDateTime/surveyDateTime';
import SurveyResults from 'components/systemConsole/surveyResults/surveyResults';
import TeamFilter from 'components/systemConsole/teamFilter/teamFilter';

import type {CombinedConfig, CustomComponentProps, CustomConfigTypes} from 'types/mattermost-webapp';

export type CustomSettingChildComponentProp = CustomComponentProps & {
    setInitialSetting: (settingId: string, settings: CustomConfigTypes) => void;
}

function SystemConsoleSetting(props: CustomComponentProps) {
    const {id, onChange, setSaveNeeded} = props;

    // This holds the combined config of all sub-configs
    const [config, setConfig] = useState<CombinedConfig>({} as CombinedConfig);

    const onChangeWrapper = useCallback((settingId: string, settings: CustomConfigTypes) => {
        const newConfig = {
            ...config,
            [settingId]: settings,
        };

        setConfig(newConfig);
        onChange(id, newConfig);
        setSaveNeeded();
    }, [config, id, onChange, setSaveNeeded]);

    // This is called by sub-config components on mount.
    // Every sub-config component sets its config either from the saved values
    // or the default values. Whatever they do, they are expected
    // to call this with the settings they decide are to be set initially.
    //
    // This is needed so that on change in one sub-setting, we know all other sub-settings as well and thus
    // can save the entire setting object on server side.
    // Otherwise the displayed default values will never get saved unless a user changes them.
    const setDefaults = useCallback((settingId: string, settings: CustomConfigTypes) => {
        setConfig((existingConfig) => ({
            ...existingConfig,
            [settingId]: settings,
        }));
    }, []);

    const modifiedProps = useMemo((): CustomSettingChildComponentProp => ({
        ...props,
        onChange: onChangeWrapper,
        setInitialSetting: setDefaults,
    }), [onChangeWrapper, props, setDefaults]);

    return (
        <div className='SystemConsoleSetting vertical'>
            <div className='horizontal'>
                <div className='settingLabel'>
                    {'Enable survey:'}
                </div>
                <div className='customSettingComponent'>
                    <EnableSurvey
                        {...modifiedProps}
                        id='EnableSurvey'
                    />
                </div>
            </div>

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

            <div className='horizontal'>
                <div className='customSettingComponent'>
                    <SurveyResults
                        {...modifiedProps}
                        id='SurveyResults'
                    />
                </div>
            </div>
        </div>
    );
}

export default SystemConsoleSetting;
