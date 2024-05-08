// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import classNames from 'classnames';
import React, {useState} from 'react';
import {Modal} from 'react-bootstrap';

import './style.scss';

type Props = {
    id: string;
    className?: string;
    onExited?: () => void;
    modalHeaderText?: React.ReactNode;
    show?: boolean;
    handleCancel?: () => void;
    handleConfirm?: () => void;
    handleEnterKeyPress?: () => void;
    handleKeydown?: (event?: React.KeyboardEvent<HTMLDivElement>) => void;
    confirmButtonText?: React.ReactNode;
    confirmButtonClassName?: string;
    cancelButtonText?: React.ReactNode;
    cancelButtonClassName?: string;
    isConfirmDisabled?: boolean;
    isDeleteModal?: boolean;
    autoCloseOnCancelButton?: boolean;
    autoCloseOnConfirmButton?: boolean;
    enforceFocus?: boolean;
    container?: React.ReactNode | React.ReactNodeArray;
    ariaLabel?: string;
    errorText?: string | React.ReactNode;
    backdrop?: boolean;
    backdropClassName?: string;
    tabIndex?: number;
    children: React.ReactNode;
    autoFocusConfirmButton?: boolean;
    keyboardEscape?: boolean;
    headerInput?: React.ReactNode;
    bodyPadding?: boolean;
    bodyDivider?: boolean;
    footerContent?: React.ReactNode;
    footerDivider?: boolean;
    appendedContent?: React.ReactNode;
    headerButton?: React.ReactNode;
};

function GenericModal({
    className,
    onExited,
    modalHeaderText,
    show = true,
    handleCancel,
    handleConfirm,
    handleEnterKeyPress,
    handleKeydown,
    confirmButtonText,
    confirmButtonClassName,
    cancelButtonText,
    cancelButtonClassName,
    isConfirmDisabled,
    isDeleteModal,
    id,
    autoCloseOnCancelButton = true,
    autoCloseOnConfirmButton = true,
    enforceFocus = true,
    container,
    ariaLabel,
    errorText,
    backdrop,
    backdropClassName,
    tabIndex,
    children,
    autoFocusConfirmButton,
    keyboardEscape,
    headerInput,
    bodyPadding,
    bodyDivider,
    footerContent,
    footerDivider,
    appendedContent,
    headerButton,
}: Props) {
    const [showModal, setShowModal] = useState(show);

    const onHide = () => {
        setShowModal(false);
    };

    const handleCancelClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        if (autoCloseOnCancelButton) {
            onHide();
        }
        if (handleCancel) {
            handleCancel();
        }
    };

    const handleConfirmClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        if (autoCloseOnConfirmButton) {
            onHide();
        }
        if (handleConfirm) {
            handleConfirm();
        }
    };

    const onEnterKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            if (event.nativeEvent.isComposing) {
                return;
            }
            if (autoCloseOnConfirmButton) {
                onHide();
            }
            if (handleEnterKeyPress) {
                handleEnterKeyPress();
            }
        }
        handleKeydown?.(event);
    };

    let confirmButton;
    if (handleConfirm) {
        const isConfirmOrDeleteClassName = isDeleteModal ? 'delete' : 'confirm';
        let buttonText: React.ReactNode = (<span>{'Confirm'}</span>);
        if (confirmButtonText) {
            buttonText = confirmButtonText;
        }

        confirmButton = (
            <button
                autoFocus={autoFocusConfirmButton}
                type='submit'
                className={classNames('GenericModal__button btn btn-primary', isConfirmOrDeleteClassName, confirmButtonClassName, {
                    disabled: isConfirmDisabled,
                })}
                onClick={handleConfirmClick}
                disabled={isConfirmDisabled}
            >
                {buttonText}
            </button>
        );
    }

    let cancelButton;
    if (handleCancel) {
        let buttonText: React.ReactNode = (<span>{'Cancel'}</span>);
        if (cancelButtonText) {
            buttonText = cancelButtonText;
        }

        cancelButton = (
            <button
                type='button'
                className={classNames('GenericModal__button btn btn-tertiary', cancelButtonClassName)}
                onClick={handleCancelClick}
            >
                {buttonText}
            </button>
        );
    }

    const headerText = modalHeaderText && (
        <div className='GenericModal__header'>
            <h1
                id='genericModalLabel'
                className='modal-title'
            >
                {modalHeaderText}
            </h1>
            {headerButton}
        </div>
    );

    return (
        <Modal
            id={id}
            role='dialog'
            aria-label={ariaLabel}
            aria-labelledby={ariaLabel ? undefined : 'genericModalLabel'}
            dialogClassName={classNames('a11y__modal GenericModal', 'GenericModal__compassDesign', className)}
            show={showModal}
            restoreFocus={true}
            enforceFocus={enforceFocus}
            onHide={onHide}
            onExited={onExited}
            backdrop={backdrop}
            backdropClassName={backdropClassName}
            container={container}
            keyboard={keyboardEscape}
        >
            <div
                onKeyDown={onEnterKeyDown}
                tabIndex={tabIndex || 0}
                className='GenericModal__wrapper-enter-key-press-catcher'
            >
                <Modal.Header closeButton={true}>
                    <div>
                        {headerText}
                        {headerInput}
                    </div>
                </Modal.Header>
                <Modal.Body className={classNames({divider: bodyDivider})}>
                    {errorText && (
                        <div className='genericModalError'>
                            <i className='icon icon-alert-outline'/>
                            <span>{errorText}</span>
                        </div>
                    )}
                    <div className={classNames('GenericModal__body', {padding: bodyPadding})}>{children}</div>
                </Modal.Body>
                {(cancelButton || confirmButton || footerContent) && (
                    <Modal.Footer className={classNames({divider: footerDivider})}>
                        {(cancelButton || confirmButton) ? (
                            <>
                                {cancelButton}
                                {confirmButton}
                            </>
                        ) : (
                            footerContent
                        )}
                    </Modal.Footer>
                )}
                {Boolean(appendedContent) && appendedContent}
            </div>
        </Modal>
    );
}

export default GenericModal;
