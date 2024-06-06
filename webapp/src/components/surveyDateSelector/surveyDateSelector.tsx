// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {startOfTomorrow} from 'date-fns';
import React, {useCallback, useMemo, useRef} from 'react';

import DatePicker from 'components/common/datePicker';
import Icon from 'components/common/icon/icon';

import './style.scss';

const dateFormattingOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: 'numeric',
};

export type Props = {
    value?: Date;
    onChange: (value?: Date) => void;
};

const SurveyDateSelector = ({value, onChange}: Props) => {
    const tomorrow = useRef(startOfTomorrow());

    const formattedDate = useMemo(
        () => (value ? value.toLocaleDateString(undefined, dateFormattingOptions) : ''),
        [value],
    );

    const handleOnChange = useCallback((date?: Date) => {
        let dateToUse: Date | undefined;

        if (date) {
            const year = date.getFullYear();
            const month = date.getMonth();
            const day = date.getDate();

            dateToUse = new Date(year, month, day);
        } else {
            dateToUse = undefined;
        }

        onChange(dateToUse);
        onChange(dateToUse);
    }, [onChange]);

    const handleClearDate = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();

        handleOnChange(undefined);
    }, [handleOnChange]);

    return (
        <DatePicker
            onSelect={handleOnChange}
            value={value}
            /* eslint-disable-next-line no-process-env */
            disableBefore={process.env.mode === 'production' ? tomorrow.current : undefined}
        >
            <div className='SurveyDateSelector form-control'>
                <Icon icon='calendar-outline'/>
                <input
                    className='input'
                    disabled={true}
                    value={formattedDate}
                    placeholder='Select a date'
                />
                {
                    value &&
                    <span
                        className='clearDate icon'
                        onClick={handleClearDate}
                    >
                        <Icon icon='close-circle'/>
                    </span>
                }
            </div>
        </DatePicker>
    );
};

export default SurveyDateSelector;
