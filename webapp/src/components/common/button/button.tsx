// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useMemo} from 'react';

import './style.scss';

export interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    text?: string;
    buttonType?: 'primary' | 'secondary' | 'tertiary';
    danger?: boolean;
    iconClass?: string;
    iconPlacement?: 'left' | 'right';
}
function Button({
    text,
    buttonType = 'tertiary',
    danger = false,
    iconClass,
    iconPlacement = 'left',
    ...rest
}: Props) {
    const buttonClassName = classNames({
        btn: true,
        iconButton: !text,
        'btn-primary': buttonType === 'primary',
        'btn-secondary': buttonType === 'secondary',
        'btn-tertiary': buttonType === 'tertiary',
        'btn-danger': danger,
    });

    const iconComponent = useMemo(() => {
        return (
            <span
                aria-hidden='true'
                className={`icon ${iconClass}`}
            />
        );
    }, [iconClass]);

    return (
        <button
            className={buttonClassName}
            {...rest}
        >
            {iconClass && iconPlacement === 'left' && iconComponent}

            {text}

            {iconClass && iconPlacement === 'right' && iconComponent}
        </button>
    );
}

export default Button;
