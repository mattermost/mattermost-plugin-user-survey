// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import type {Team, TeamsWithCount} from '@mattermost/types/teams';

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
    {text: 'Do not send to selected teams', value: 'exclude_selected'},
];

function TeamFilter({id, setSaveNeeded, onChange, config, setInitialSetting}: CustomSettingChildComponentProp) {
    const [selectedTeams, setSelectedTeams] = useState<DropdownOption[]>([]);
    const [initialOptions, setInitialOptions] = useState<DropdownOption[]>([]);
    const [teamFilterType, setTeamFilterType] = useState<TeamFilterType>('everyone');

    // For fetching initial few teams for displaying in the multiselect dropdown
    useEffect(() => {
        const task = async () => {
            // getTeams always returns Team[] when includeTotalCount param is set to false
            const teams = await Client4.getTeams(0, 20, false) as Team[];
            const options = teams.map((team): DropdownOption => ({
                value: team.id,
                label: team.display_name,
                raw: team,
            }));
            setInitialOptions(options);
        };

        task();
    }, []);

    // For fetching the teams which are selected so their names can be displayed
    useEffect(() => {
        const savedSetting = config.PluginSettings.Plugins['com.mattermost.user-survey']?.systemconsolesetting?.TeamFilter;
        const initialFilterTypeValue = savedSetting?.filterType || 'everyone';
        setTeamFilterType(initialFilterTypeValue);

        const task = async () => {
            if (!savedSetting?.filteredTeamIDs) {
                return;
            }

            const teamsByID: {[key: string]: Team} = {};

            const getTeamsByIds = async (teamIds: string[]): Promise<Team[]> => {
                const teams: Team[] = [];
                const getTeamPromises: Array<Promise<void>> = [];

                const fetchTeam = async (teamId: string) => {
                    const team = await Client4.getTeam(teamId);
                    teams.push(team);
                    return Promise.resolve();
                };

                teamIds.forEach((teamId) => {
                    getTeamPromises.push(fetchTeam(teamId));
                });

                await Promise.all(getTeamPromises);

                return teams;
            };

            // fetch selected teams
            const teams = await getTeamsByIds(savedSetting.filteredTeamIDs);
            teams.forEach((team) => {
                teamsByID[team.id] = team;
            });

            // convert team objects to DropdownOption for displaying
            const selectedOptions = savedSetting.filteredTeamIDs.map((teamId) => {
                const team = teamsByID[teamId];
                return {
                    label: team?.display_name || `Archived Team: ${teamId}`,
                    value: teamId,
                    raw: team,
                };
            });

            setSelectedTeams(selectedOptions);

            const initialConfig: TeamFilterConfig = {
                filteredTeamIDs: optionsToTeamIDs(selectedOptions),
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

    const searchTeams = useCallback(async (inputValue: string) => {
        // response is always TeamsWithCount when paginating
        const {teams} = await Client4.searchTeams(inputValue, {page: 0, per_page: 100}) as TeamsWithCount;

        return teams.map((team): DropdownOption => ({
            value: team.id,
            label: team.display_name,
            raw: team,
        }));
    }, []);

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
                    options={initialOptions}
                    customComponents={customComponents}
                    values={selectedTeams}
                    onChange={teamFilterOnChangeHandler}
                    searchOptions={searchTeams}
                />
            }

            <div className='horizontal'>
                <p>
                    {
                        teamFilterType === 'everyone' &&
                        'The survey will be sent to all users.'
                    }

                    {
                        teamFilterType === 'include_selected' &&
                        'The survey will be sent to users who are a part of the selected teams.'
                    }

                    {
                        teamFilterType === 'exclude_selected' &&
                        <div>
                            {'The survey'} <b>{'WILL NOT'}</b> {' be sent to users who are a part of the selected teams.'}
                        </div>
                    }

                </p>
            </div>
        </div>
    );
}

const optionsToTeamIDs = (teams: DropdownOption[]): string[] => teams.map((option) => option.value);

export default TeamFilter;
