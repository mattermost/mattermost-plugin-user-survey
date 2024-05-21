// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import './style.scss';

import Icon from 'components/common/icon/icon';

export type Props = {
    title: string;
    subTitle?: string;
    children: React.ReactNode;
    className?: string;
    collapsible?: boolean;
    toggleFromHeader?: boolean;
}

export default function Panel({title, subTitle, children, className, collapsible, toggleFromHeader}: Props) {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [height, setHeight] = useState<number>();

    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!collapsible || !contentRef.current) {
            return;
        }

        if (isCollapsed) {
            setHeight(0);
        } else {
            setHeight(contentRef.current.scrollHeight);
        }
    }, [isCollapsed, children, collapsible]);

    const handleToggleFromHeader = useCallback(() => {
        if (!collapsible || toggleFromHeader === false) {
            return;
        }

        setIsCollapsed((collapsed) => !collapsed);
    }, [collapsible, toggleFromHeader]);

    const handleToggleFromButton = useCallback(() => {
        if (!collapsible || toggleFromHeader !== true) {
            return;
        }

        setIsCollapsed((collapsed) => !collapsed);
    }, [collapsible, toggleFromHeader]);

    return (
        <div className={classNames('Panel', className)}>
            <div
                className={classNames('panelHeader', 'horizontal', {pointer: collapsible && toggleFromHeader !== false})}
                onClick={handleToggleFromHeader}
            >
                <div className='left verical'>
                    <h5>{title}</h5>
                    {
                        subTitle &&
                        <p>{subTitle}</p>
                    }
                </div>
                {
                    collapsible &&
                    <div
                        className='right'
                    >
                        <div
                            className={classNames('toggleCollapseButton', {pointer: toggleFromHeader === false})}
                            onClick={handleToggleFromButton}
                        >
                            <Icon icon={isCollapsed ? 'chevron-up' : 'chevron-down'}/>
                        </div>
                    </div>
                }
            </div>

            <div
                className={classNames('panelBody', 'vertical', {isCollapsed})}
                ref={contentRef}
                style={{height}}
            >
                {children}
            </div>
        </div>
    );
}
