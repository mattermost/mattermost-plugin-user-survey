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
    // Otherwise, the displayed default values will never get saved unless a user changes them.
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

    const settings = useMemo(() => {
        return [
            {
                id: 'EnableSurvey',
                title: 'Enable survey:',
                Component: EnableSurvey,
            },
            {
                id: 'SurveyDateTime',
                title: 'Send next survey at:',
                Component: SurveyDateTime,
            },
            {
                id: 'SurveyExpiry',
                title: 'Survey expiry (days):',
                Component: Expiry,
            },
            {
                id: 'TeamFilter',
                title: 'Exclude specific teams',
                Component: TeamFilter,
            },
            {
                id: 'SurveyQuestions',
                Component: Questions,
            },
            {
                id: 'SurveyResults',
                Component: SurveyResults,
            },
        ];
    }, []);

    const body = useMemo(() => {
        return settings.map((Setting) => {
            return (
                <div
                    key={Setting.id}
                    className='horizontal'
                >
                    {
                        Setting.title &&
                        <div className='settingLabel'>
                            {Setting.title}
                        </div>
                    }
                    <div className='customSettingComponent'>
                        <Setting.Component
                            {...modifiedProps}
                            id={Setting.id}
                        />
                    </div>
                </div>
            );
        });
    }, [modifiedProps, settings]);

    return (
        <div className='SystemConsoleSetting vertical'>
            {body}
        </div>
    );
}

export default SystemConsoleSetting;
