// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useMemo} from 'react';
import Select from 'react-select';

import Control from 'components/common/dropdown/control';

export type DropdownOption = {
    value: string,
    label: string,
};

export type Props = {
    options: Array<DropdownOption>
    value?: DropdownOption
    defaultValue?: DropdownOption
    onChange: (newValue: DropdownOption) => void
}
const Dropdown = ({options, value, defaultValue, onChange}: Props) => {
    const customComponents = useMemo(() => {
        return {
            Control,
        };
    }, []);

    return (
        <Select
            value={value || defaultValue}
            options={options}
            components={customComponents}
            onChange={onChange}
        />
    );
};

export default Dropdown;
