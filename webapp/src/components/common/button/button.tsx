// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useMemo} from 'react';

import './style.scss';

export type Props = {
    text?: string;
    type?: 'primary' | 'secondary' | 'tertiary';
    danger?: boolean;
    iconClass?: string;
    iconPlacement?: 'left' | 'right';
    disabled?: boolean;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
};
function Button({text, type = 'tertiary', danger = false, iconClass, iconPlacement = 'left', disabled = false, onClick}: Props) {
    const buttonClassName = classNames({
        btn: true,
        iconButton: !text,
        'btn-primary': type === 'primary',
        'btn-secondary': type === 'secondary',
        'btn-tertiary': type === 'tertiary',
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
            disabled={disabled}
            onClick={onClick}
        >
            {iconClass && iconPlacement === 'left' && iconComponent}

            {text}

            {iconClass && iconPlacement === 'right' && iconComponent}
        </button>
    );
}

export default Button;
