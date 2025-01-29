// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React from 'react';

import Icon from 'components/common/icon/icon';

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

    return (
        <button
            className={buttonClassName}
            {...rest}
        >
            {iconClass && iconPlacement === 'left' && <Icon icon={iconClass}/>}

            {text}

            {iconClass && iconPlacement === 'right' && <Icon icon={iconClass}/>}
        </button>
    );
}

export default Button;
