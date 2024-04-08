// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import type {OptionProps} from 'react-select';
import {components} from 'react-select';

import type {DropdownOption} from 'components/common/dropdown/dropdown';
import TeamIcon from 'components/systemConsole/teamFilter/teamIcon/teamIcon';

import './style.scss';

export const CustomOption = ({children, data, ...props}: OptionProps<DropdownOption>) => {
    return (
        <components.Option {...{data, ...props}}>
            <div className='customOption_row'>
                <TeamIcon data={data}/>
                <span className='childrenContainer'>{children}</span>
            </div>
        </components.Option>
    );
};
