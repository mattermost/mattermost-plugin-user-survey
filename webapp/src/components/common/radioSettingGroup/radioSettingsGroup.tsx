// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import './style.scss';

export type RadioSetting = { text: string; value: string };

interface Props {
    id: string;

    // label: React.ReactNode;
    values: RadioSetting[];
    value: string;

    // setByEnv: boolean;
    disabled?: boolean;

    // helpText?: React.ReactNode;
    onChange(id: string, value: string): void;

    orientation?: 'horizontal' | 'vertical';
}
export default function RadioSettingsGroup({
    id,
    values,
    value,

    // setByEnv,
    disabled = false,
    onChange,
    orientation = 'vertical',
}: Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(id, e.target.value);
    };

    const options = values.map(({value: optionValue, text}) => (
        <div
            className='radio'
            key={optionValue}
        >
            <label>
                <input
                    type='radio'
                    value={optionValue}
                    name={id}
                    checked={optionValue === value}
                    onChange={handleChange}

                    // disabled={disabled || setByEnv}
                    disabled={disabled}
                />
                {text}
            </label>
        </div>
    ));

    return (
        <div className={`RadioSettingGroup ${orientation}`}>
            {options}
        </div>
    );
}
