import React from 'react';

import './style.scss';

export type Props = {

};

const DatePicker = ({}: Props) => {
    return (
        <div className='DatePicker form-control'>
            <i className='icon-calendar-outline'/>
            <input
                className='input'
            />
        </div>
    );
};

export default DatePicker;
