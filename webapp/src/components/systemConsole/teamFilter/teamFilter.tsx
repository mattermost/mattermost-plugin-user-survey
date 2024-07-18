// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import type {Team} from '@mattermost/types/teams';

import {Client4} from 'mattermost-redux/client';

import type {DropdownOption} from 'components/common/dropdown/dropdown';
import type {CustomComponentsDefinition} from 'components/common/multiSelect/multiselect';
import Multiselect from 'components/common/multiSelect/multiselect';
import type {RadioSetting} from 'components/common/radioSettingGroup/radioSettingsGroup';
import RadioSettingsGroup from 'components/common/radioSettingGroup/radioSettingsGroup';
import type {CustomSettingChildComponentProp} from 'components/systemConsole/index';
import {
    CustomMultiValueContainer,
} from 'components/systemConsole/teamFilter/customMultiValueContainer/customMultiValueContainer';
import {CustomOption} from 'components/systemConsole/teamFilter/customOption/customOption';

import type {TeamFilterConfig} from 'types/plugin';

import './style.scss';

export type TeamFilterType = 'everyone' | 'include_selected' | 'exclude_selected';

const TEAM_FILTER_FILTER_TYPE_OPTIONS: RadioSetting[] = [
    {text: 'Send to everyone', value: 'everyone'},
    {text: 'Send to selected teams', value: 'include_selected'},
    {text: 'Do not send to selected teams', value: 'excluded_selected'},
];

function TeamFilter({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    const [selectedTeams, setSelectedTeams] = useState<DropdownOption[]>([]);
    const [allTeamsOptions, setAllTeamsOptions] = useState<DropdownOption[]>([]);
    const [teamFilterType, setTeamFilterType] = useState<TeamFilterType>('everyone');

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

            const savedSetting = config.PluginSettings.Plugins['com.mattermost.user-survey']?.systemconsolesetting?.TeamFilter;
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

            const initialFilterTypeValue = savedSetting?.filterType || 'everyone';
            setTeamFilterType(initialFilterTypeValue);

            const initialConfig: TeamFilterConfig = {
                filteredTeamIDs: optionsToTeamIDs(initialOptions),
                filterType: initialFilterTypeValue,
            };
            setInitialSetting(id, initialConfig);
        };

        task();
    }, [config.PluginSettings.Plugins, id, setInitialSetting]);

    const customComponents: CustomComponentsDefinition = useMemo(() => ({
        Option: CustomOption,
        MultiValueContainer: CustomMultiValueContainer,
    }), []);

    const saveSettings = useCallback((teams: DropdownOption[], filterType: TeamFilterType) => {
        setSaveNeeded();
        const config: TeamFilterConfig = {
            filteredTeamIDs: optionsToTeamIDs(teams),
            filterType,
        };
        onChange(id, config);
    }, [id, onChange, setSaveNeeded]);

    const teamFilterOnChangeHandler = useCallback((selectedTeams: DropdownOption[]) => {
        setSelectedTeams(selectedTeams);
        saveSettings(selectedTeams, teamFilterType);
    }, [saveSettings, teamFilterType]);

    const teamFilterTypeChangeHandler = useCallback((id: string, value: string) => {
        setTeamFilterType(value as TeamFilterType);
        saveSettings(selectedTeams, value as TeamFilterType);
    }, [saveSettings, selectedTeams]);

    return (
        <div className='TeamFilter'>
            <RadioSettingsGroup
                id='teamFilterType'
                values={TEAM_FILTER_FILTER_TYPE_OPTIONS}
                value={teamFilterType}
                onChange={teamFilterTypeChangeHandler}
            />

            {
                teamFilterType !== 'everyone' &&
                <Multiselect
                    options={allTeamsOptions}
                    customComponents={customComponents}
                    values={selectedTeams}
                    onChange={teamFilterOnChangeHandler}
                />
            }

            <div className='horizontal'>
                <p>
                    {/* TODO update hep tesxt absed on the selected filtertype*/}
                    {'Select the teams that the next survey should NOT be sent to. The survey will be sent to all teams if this field is left blank.'}
                </p>
            </div>
        </div>
    );
}

const optionsToTeamIDs = (teams: DropdownOption[]): string[] => teams.map((option) => option.value);

export default TeamFilter;
