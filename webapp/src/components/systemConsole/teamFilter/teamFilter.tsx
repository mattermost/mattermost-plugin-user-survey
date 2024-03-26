// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useEffect, useMemo, useState} from 'react';

import type {CustomComponentProps} from 'types/mattermost-webapp';

import './style.scss';
import {Client4} from 'mattermost-redux/client';
import type {Team} from 'mattermost-redux/types/teams';

import type {DropdownOption} from 'components/common/dropdown/dropdown';
import Multiselect from 'components/common/multiSelect/multiselect';
import {CustomOption} from 'components/systemConsole/teamFilter/customOption/customOption';

function TeamFilter({id, setSaveNeeded, onChange, config}: CustomComponentProps) {
    const [allTeamsOptions, setAllTeamsOptions] = useState<DropdownOption[]>([]);

    useEffect(() => {
        const task = async () => {
            const teams: Team[] = await Client4.getTeams(0, 10000, false) as Team[];
            const options = teams.
                filter((team) => team.delete_at === 0).
                map((team): DropdownOption => {
                    return {
                        value: team.id,
                        label: team.display_name,
                    };
                });
            setAllTeamsOptions(options);
        };

        task();
    }, []);

    return (
        <Multiselect
            options={allTeamsOptions}
        />
    );
}

export default TeamFilter;
