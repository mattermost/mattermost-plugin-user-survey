// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {components, ControlProps} from 'react-select';

import {DropdownOption} from 'components/common/dropdown/dropdown';

const Control = ({children, ...rest}: ControlProps<DropdownOption>) => {
    return (
        <components.Control
            {...rest}
        >
            <i className='icon-clock-outline'/>
            {children}
        </components.Control>
    );
};

export default Control;
