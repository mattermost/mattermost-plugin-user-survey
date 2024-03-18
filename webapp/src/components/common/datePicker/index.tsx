// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useRef, useState} from 'react';

import './style.scss';
import {
    autoUpdate,
    flip,
    FloatingFocusManager,
    offset,
    shift,
    useDismiss,
    useFloating,
    useInteractions,
} from '@floating-ui/react';

import {DayPicker} from 'react-day-picker';

export type Props = {
    value?: Date
    children: React.ReactNode
    onSelect: (date: Date) => void
    closeOnSelect?: boolean
};

const DatePicker = ({value, children, onSelect, closeOnSelect}: Props) => {
    const [isPopupOpen, setPopupOpen] = useState<boolean>(false);

    const onSelectHandler = useCallback((day: Date) => {
        onSelect(day);

        // Checking it this way to handle null and undefined.
        // The default behavior is to close on select.
        if (closeOnSelect || typeof closeOnSelect === 'undefined') {
            setPopupOpen(false);
        }
    }, [closeOnSelect, onSelect]);

    const {context} = useFloating({
        open: isPopupOpen,
        onOpenChange: (open) => setPopupOpen(open),
        placement: 'bottom-end',
        whileElementsMounted: autoUpdate,
        middleware: [
            offset(5),
            flip({fallbackPlacements: ['bottom-end', 'top-start', 'top-end', 'right-start', 'left-start'], padding: 5}),
            shift(),
        ],
    });

    const {getReferenceProps, getFloatingProps} = useInteractions([
        useDismiss(context, {
            enabled: true,
            outsidePress: true,
        }),
    ]);

    const popperRef = useRef<HTMLDivElement>(null);

    return (
        <div className='DatePicker'>
            <div
                ref={popperRef}
                className='childrenWrapper'
                onClick={() => setPopupOpen((open) => !open)}
                {...getReferenceProps()}
            >
                {children}
            </div>
            {
                isPopupOpen && (
                    <FloatingFocusManager
                        context={context}
                        modal={true}
                        initialFocus={-1}
                    >
                        <div
                            className='rdp_wrapper'
                            {...getFloatingProps()}
                        >
                            <DayPicker
                                selected={value}
                                defaultMonth={value}
                                className='DatePicker-day-picker'
                                disabled={{
                                    before: new Date(),
                                }}
                                onDayClick={onSelectHandler}
                            />
                        </div>
                    </FloatingFocusManager>
                )}
        </div>
    );
};

export default DatePicker;
