// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import type {GroupBase, MultiValue, SingleValue} from 'react-select';
import AsyncSelect from 'react-select/async';
import type {SelectComponentsConfig} from 'react-select/dist/declarations/src/components';

import type {DropdownOption} from 'components/common/dropdown/dropdown';
export type CustomComponentsDefinition = SelectComponentsConfig<DropdownOption, true, GroupBase<DropdownOption>>

export type Props = {
    options: DropdownOption[];
    values?: DropdownOption[];
    customComponents?: CustomComponentsDefinition;
    onChange: (selectedValues: DropdownOption[]) => void;
    searchOptions: (inputValue: string) => Promise<DropdownOption[]>;
}

function Multiselect({options, values, customComponents, onChange, searchOptions}: Props) {
    const onChangeHandler = useCallback((newValue: SingleValue<DropdownOption> | MultiValue<DropdownOption>) => {
        if (Array.isArray(newValue)) {
            onChange(newValue);
        }
    }, [onChange]);

    return (
        <AsyncSelect
            isMulti={true}
            isClearable={true}
            value={values}
            components={customComponents}
            onChange={onChangeHandler}
            defaultOptions={options}
            cacheOptions={true}
            loadOptions={searchOptions}
        />
    );
}

export default Multiselect;
