import React, {useCallback, useMemo, useRef, useState} from 'react';

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
import {DayModifiers, DayPicker} from 'react-day-picker';

export type Props = {
    children: React.ReactNode
    onSelect: (date: Date) => void
};

const DatePicker = ({children, onSelect}: Props) => {
    const popperRef = useRef<HTMLDivElement>(null);

    const [isPopupOpen, setPopupOpen] = useState<boolean>(false);

    const {x, y, strategy, context, refs: {setReference, setFloating}} = useFloating({
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

    const onSelectHandler = useCallback((day: Date, modifiers: DayModifiers) => {
        onSelect(day);
    }, []);

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
                            ref={setFloating}
                            {...getFloatingProps()}
                        >
                            <DayPicker
                                className='DatePicker-day-picker'
                                disabled={{
                                    before: new Date(),
                                }}
                                onDayClick={onSelect}
                            />
                        </div>
                    </FloatingFocusManager>
                )}
        </div>
    );
};

export default DatePicker;
