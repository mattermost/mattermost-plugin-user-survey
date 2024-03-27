// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useMemo, useState} from 'react';

import './style.scss';
import {DropdownOption} from 'components/common/dropdown/dropdown';
import Select, {type MultiValue, type SingleValue} from 'react-select';

export type Props = {
    options: DropdownOption[];
    values?: DropdownOption[];
    customComponents?: any;
}

function Multiselect({options, values, customComponents}: Props) {
    const [val, setVal] = useState<DropdownOption[]>([]);

    const onChangeHandler = useCallback((newValue: SingleValue<DropdownOption> | MultiValue<DropdownOption>) => {
        if (Array.isArray(newValue)) {
            setVal(newValue);
        }
    }, []);

    return (
        <Select
            isMulti={true}
            isClearable={false}
            value={val}
            options={options}
            components={customComponents}
            onChange={onChangeHandler}
        />
    );
}

export default Multiselect;
