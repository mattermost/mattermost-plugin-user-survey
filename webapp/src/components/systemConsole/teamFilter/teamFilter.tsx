// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useMemo, useState} from 'react';

import type {CustomComponentProps, TeamFilter} from 'types/mattermost-webapp';

import './style.scss';
import {Client4} from 'mattermost-redux/client';
import type {Team} from 'mattermost-redux/types/teams';

import type {DropdownOption} from 'components/common/dropdown/dropdown';
import type {CustomComponentsDefinition} from 'components/common/multiSelect/multiselect';
import Multiselect from 'components/common/multiSelect/multiselect';
import {
    CustomMultiValueContainer,
} from 'components/systemConsole/teamFilter/customMultiValueContainer/customMultiValueContainer';
import {CustomOption} from 'components/systemConsole/teamFilter/customOption/customOption';

function TeamFilter({id, setSaveNeeded, onChange, config}: CustomComponentProps) {
    const [selectedTeams, setSelectedTeams] = useState<DropdownOption[]>([]);
    const [allTeamsOptions, setAllTeamsOptions] = useState<DropdownOption[]>([]);

    // fetch all teams to populate options
    useEffect(() => {
        const task = async () => {
            const teams: Team[] = await Client4.getTeams(0, 10000, false) as Team[];
            const options = teams.
                filter((team) => team.delete_at === 0).
                map((team): DropdownOption => {
                    return {
                        value: team.id,
                        label: team.display_name,
                        raw: team,
                    };
                });
            setAllTeamsOptions(options);

            const savedSetting = config.PluginSettings.Plugins['com.mattermost.user-survey']?.teamfilter;
            if (savedSetting?.filteredTeamIDs) {
                const intialOptions: DropdownOption[] = savedSetting.filteredTeamIDs.map((teamId) => {
                    const team = options.find((option) => option.value === teamId);
                    return {
                        label: team?.label || `Archived Team: ${teamId}`,
                        value: teamId,
                        raw: team?.raw,
                    };
                });

                setSelectedTeams(intialOptions);
            }
        };

        task();
    }, [config.PluginSettings.Plugins]);

    const customComponents: CustomComponentsDefinition = useMemo(() => (
        {
            Option: CustomOption,
            MultiValueContainer: CustomMultiValueContainer,

        }
    ), []);

    const saveSettings = useCallback((teams: DropdownOption[]) => {
        setSaveNeeded();

        const setting: TeamFilter = {
            filteredTeamIDs: teams.map((option) => option.value),
        };
        onChange(id, setting);
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

export default TeamFilter;
