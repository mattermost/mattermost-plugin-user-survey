// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo} from 'react';
import type {MultiValue, SingleValue} from 'react-select';
import Select from 'react-select';

import Control from 'components/common/dropdown/control';

export type DropdownOption = {
    value: string;
    label: string;
    raw?: unknown;
};

export type Props = {
    options: DropdownOption[];
    value?: DropdownOption;
    defaultValue?: DropdownOption;
    onChange: (newValue: DropdownOption) => void;
}
const Dropdown = ({options, value, defaultValue, onChange}: Props) => {
    const customComponents = useMemo(() => ({Control}), []);

    // This handler only serves the purpose of satisfying typescript.
    // Otherwise it complains abut incorrect type's callback passed to Select's onChange prop.
    const onChangeHandler = useCallback((newValue: SingleValue<DropdownOption> | MultiValue<DropdownOption>) => {
        onChange(newValue as DropdownOption);
    }, [onChange]);

    // the value needs to be picked picked out of the options array
    // to make React Select scroll the selected value into view when
    // opening the dropdown menu.
    const selectedValue = useMemo(() => {
        const targetValue = value || defaultValue;
        return options.find((option) => option.value === targetValue?.value);
    }, [options, value, defaultValue]);

    return (
        <Select
            value={selectedValue}
            options={options}
            components={customComponents}
            onChange={onChangeHandler}
        />
    );
};

export default Dropdown;
