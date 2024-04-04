// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import type {Team} from '@mattermost/types/teams';

import {Client4} from 'mattermost-redux/client';

import type {DropdownOption} from 'components/common/dropdown/dropdown';

import './style.scss';

export type Props = {
    data: DropdownOption;
}
function TeamIcon({data}: Props) {
    const teamIconLastUpdated = (data.raw as Team).last_team_icon_update;
    if (teamIconLastUpdated) {
        const teamURL = Client4.getTeamIconUrl(data.value, teamIconLastUpdated);
        return (
            <div className='customOption_imageContainer'>
                <div
                    className='teamImage'
                    style={{
                        background: `url("${teamURL}")`,
                    }}
                />
            </div>
        );
    }

    // if a team icon isn't available, we use the first
    // two letters of team's display name as a placeholder icon.
    return (
        <div className='customOption_imageContainer'>
            <div className='teamImage'>
                <span className='teamImagePlaceholder'>{data.label.substring(0, 2)}</span>
            </div>
        </div>
    );
}

export default React.memo(TeamIcon);
