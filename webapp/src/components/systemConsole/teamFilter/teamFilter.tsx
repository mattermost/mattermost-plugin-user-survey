// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import type {Team} from '@mattermost/types/teams';

import {Client4} from 'mattermost-redux/client';

import type {DropdownOption} from 'components/common/dropdown/dropdown';
import type {CustomComponentsDefinition} from 'components/common/multiSelect/multiselect';
import Multiselect from 'components/common/multiSelect/multiselect';
import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';
import {
    CustomMultiValueContainer,
} from 'components/systemConsole/teamFilter/customMultiValueContainer/customMultiValueContainer';
import {CustomOption} from 'components/systemConsole/teamFilter/customOption/customOption';

import type {TeamFilterConfig} from 'types/plugin';

import './style.scss';

function TeamFilter({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    const [selectedTeams, setSelectedTeams] = useState<DropdownOption[]>([]);
    const [allTeamsOptions, setAllTeamsOptions] = useState<DropdownOption[]>([]);

    useEffect(() => {
        const task = async () => {
            // fetch all teams to populate options
            const teams: Team[] = await Client4.getTeams(0, 10000, false) as Team[];

            const teamsByID: {[key: string]: Team} = {};
            const options = teams.
                filter((team) => team.delete_at === 0).
                map((team): DropdownOption => {
                    teamsByID[team.id] = team;

                    return {
                        value: team.id,
                        label: team.display_name,
                        raw: team,
                    };
                });
            setAllTeamsOptions(options);

            const savedSetting = config.PluginSettings.Plugins['com.mattermost.user-survey']?.systemconsolesetting.TeamFilter;
            let initialOptions: DropdownOption[] = [];
            if (savedSetting?.filteredTeamIDs) {
                initialOptions = savedSetting.filteredTeamIDs.map((teamId) => {
                    const team = teamsByID[teamId];
                    return {
                        label: team?.display_name || `Archived Team: ${teamId}`,
                        value: teamId,
                        raw: team,
                    };
                });
            }

            setSelectedTeams(initialOptions);
            setInitialSetting(id, optionsToConfig(initialOptions));
        };

        task();
    }, [config.PluginSettings.Plugins, id, setInitialSetting]);

    const customComponents: CustomComponentsDefinition = useMemo(() => ({
        Option: CustomOption,
        MultiValueContainer: CustomMultiValueContainer,
    }), []);

    const saveSettings = useCallback((teams: DropdownOption[]) => {
        setSaveNeeded();
        onChange(id, optionsToConfig(teams));
    }, [id, onChange, setSaveNeeded]);

    const teamFilterOnChangeHandler = useCallback((selectedTeams: DropdownOption[]) => {
        setSelectedTeams(selectedTeams);
        saveSettings(selectedTeams);
    }, [saveSettings]);

    return (
        <div className='TeamFilter'>
            <Multiselect
                options={allTeamsOptions}
                customComponents={customComponents}
                values={selectedTeams}
                onChange={teamFilterOnChangeHandler}
            />
            <div className='horizontal'>
                <p>
                    {'Select the teams that the next survey should NOT be sent to. The survey will be sent to all teams if nothing is selected in this field.'}
                </p>
            </div>
        </div>
    );
}

const optionsToConfig = (teams: DropdownOption[]): TeamFilterConfig => ({
    filteredTeamIDs: teams.map((option) => option.value),
});

export default TeamFilter;
