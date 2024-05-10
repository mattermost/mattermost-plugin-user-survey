// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

type Props = {
    text?: React.ReactNode;
    style?: React.CSSProperties;
}
const LoadingSpinner = ({text = null, style}: Props) => {
    return (
        <span
            id='loadingSpinner'
            className={classNames('LoadingSpinner', {'with-text': Boolean(text)})}
            style={style}
            data-testid='loadingSpinner'
        >
            <span
                className='fa fa-spinner fa-fw fa-pulse spinner'
                title='Loading Icon'
            />
            {text}
        </span>
    );
};

export default React.memo(LoadingSpinner);
