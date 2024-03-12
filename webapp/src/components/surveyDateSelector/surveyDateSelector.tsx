import React, {useState} from 'react';

import './style.scss';
import DatePicker from 'components/common/datePicker';
import {format} from 'date-fns';

export type Props = {};

const SurveyDateSelector = ({}: Props) => {
    // default to 30 days later
    const [date, setDate] = useState<Date>(
        new Date(new Date().setDate((new Date()).getDate() + 30)),
    );

    return (
        <DatePicker
            onSelect={setDate}
        >
            <div className='SurveyDateSelector form-control'>
                <i className='icon-calendar-outline'/>
                <input
                    className='input'
                    disabled={true}
                    value={format(date, 'dd/MM/yyyy')}
                />
            </div>
        </DatePicker>
    );
};

export default SurveyDateSelector;
