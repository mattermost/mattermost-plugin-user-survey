import React, {useMemo} from 'react';
import Select from 'react-select';
import Control from 'components/common/dropdown/control';

export type DropdownOption = {
    value: string,
    label: string,
};

export type Props = {
    options: Array<DropdownOption>
}
const Dropdown = ({options}: Props) => {
    const customComponents = useMemo(() => {
        return {
            Control,
        };
    }, []);

    return (
        <Select
            value={options[5]}
            options={options}
            components={customComponents}
        />
    );
};

export default Dropdown;
