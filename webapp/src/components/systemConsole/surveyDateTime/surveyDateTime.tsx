import React from 'react';
import SurveyTimeSelector from 'components/surveyTimeSelector/surveyTimeSelector';
import DatePicker from 'components/datePIcker/datePicker';

import './style.scss';

function SurveyDateTime(props: any) {
    return (
        <div className='SurveyDateTime'>
            <SurveyTimeSelector/>
            <DatePicker/>
        </div>
    );
}

export default SurveyDateTime;
