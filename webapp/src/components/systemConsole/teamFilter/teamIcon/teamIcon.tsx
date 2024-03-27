// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Client4} from 'mattermost-redux/client';
import type {Team} from 'mattermost-redux/types/teams';

import type {DropdownOption} from 'components/common/dropdown/dropdown';

import './style.scss';

export type Props = {
    data: DropdownOption;
}
function TeamIcon({data}: Props) {
    if (data.raw.last_team_icon_update) {
        const teamURL = Client4.getTeamIconUrl(data.value, (data.raw as Team)?.last_team_icon_update);
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
    return (
        <div className='customOption_imageContainer'>
            <div
                className='teamImage'
            >
                <span className='teamImagePlaceholder'>{data.label[0]}</span>
            </div>
        </div>
    );
}

export default React.memo(TeamIcon);
