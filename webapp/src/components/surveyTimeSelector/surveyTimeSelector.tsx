import React, {useMemo} from 'react';
import Dropdown from 'components/common/dropdown/dropdown';

import './style.scss';

export type Props = {
    value?: string
};

const SurveyTimeSelector = ({}: Props) => {
    const options = useMemo(() => {
        const timeStrings = [];

        for (let hours = 0; hours < 24; hours++) {
            for (let minutes = 0; minutes <= 30; minutes += 30) {
                const hourString = String(hours).padStart(2, '0');
                const minuteString = String(minutes).padStart(2, '0');
                const timeString = `${hourString}:${minuteString}`;
                timeStrings.push({value: timeString, label: timeString});
            }
        }

        return timeStrings;
    }, []);

    return (
        <div className='SurveyTimeSelector'>
            <Dropdown
                options={options}
            />
        </div>
    );
};

export default SurveyTimeSelector;
