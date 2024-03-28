// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {MultiValueGenericProps} from 'react-select';
import {components} from 'react-select';

import type {DropdownOption} from 'components/common/dropdown/dropdown';
import TeamIcon from 'components/systemConsole/teamFilter/teamIcon/teamIcon';

import './style.scss';

export function CustomMultiValueContainer({children, data, ...props}: MultiValueGenericProps<DropdownOption>) {
    return (
        <div className='CustomMultiValueContainer'>
            <components.MultiValueContainer {...{data, ...props}}>
                <TeamIcon data={data}/>
                {children}
            </components.MultiValueContainer>
        </div>
    );
}
