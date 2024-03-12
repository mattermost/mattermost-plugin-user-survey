import React from 'react';
import SurveyTimeSelector from 'components/surveyTimeSelector/surveyTimeSelector';
import SurveyDateSelector from 'components/surveyDateSelector/surveyDateSelector';

import './style.scss';

function SurveyDateTime(props: any) {
    return (
        <div className='SurveyDateTime'>
            <SurveyTimeSelector/>
            <SurveyDateSelector/>
        </div>
    );
}

export default SurveyDateTime;
