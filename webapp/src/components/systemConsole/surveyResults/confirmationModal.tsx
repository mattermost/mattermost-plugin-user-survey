// Copyright (c) 2024-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import GenericModal from 'components/common/modal/modal';

export type Props = {
    id: string;
    title: string;
    bodyMessage: string;
    confirmButtonText: string;
    onExit?: () => void;
    handleConfirm: () => void;
    handleCancel: () => void;
}

export function ConfirmationModal({id, onExit, title, bodyMessage, confirmButtonText, handleConfirm, handleCancel}: Props) {
    return (
        <GenericModal
            id={id}
            modalHeaderText={title}
            confirmButtonText={confirmButtonText}
            isDeleteModal={true}
            onExited={onExit || handleCancel}
            handleConfirm={handleConfirm}
            handleCancel={handleCancel}
        >
            <span>{bodyMessage}</span>
        </GenericModal>
    );
}
