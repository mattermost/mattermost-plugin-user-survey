// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {components} from 'react-select';
import type {OptionProps} from 'react-select';

import type {DropdownOption} from 'components/common/dropdown/dropdown';

import './style.scss';

export const CustomOption = ({children, data, ...props}: OptionProps<DropdownOption>) => {
    return (
        <components.Option {...{data, ...props}}>
            <div className='customOption_row'>
                <div className='customOption_imageContainer'>
                    <div
                        className='teamImage'
                        style={{
                            background: `url("/api/v4/teams/${data.value}/image")`,
                            color: 'red',
                        }}
                    />
                    <span>{data.label[0]}</span>
                </div>
                {children}
            </div>
        </components.Option>
    );
};
