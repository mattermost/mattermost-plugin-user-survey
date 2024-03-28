// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Client4} from 'mattermost-redux/client';

import type {DropdownOption} from 'components/common/dropdown/dropdown';

import './style.scss';

import type {Team} from '@mattermost/types/teams';

export type Props = {
    data: DropdownOption;
}
function TeamIcon({data}: Props) {
    // @ts-expect-error last_team_icon_update
    // field will be included in latest types release,
    // but its there in the data already
    if (data.raw.last_team_icon_update) {
        // @ts-expect-error sane reason as above about the last_team_icon_update field
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
            <div className='teamImage'>
                <span className='teamImagePlaceholder'>{data.label[0]}</span>
            </div>
        </div>
    );
}

export default React.memo(TeamIcon);
