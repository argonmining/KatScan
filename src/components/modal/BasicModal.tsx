import React, {FC, PropsWithChildren, ReactElement} from "react";
import {useDarkMode} from "nacho-component-library";
import {Modal, ModalProps} from "react-bootstrap";
import './BasicModal.css'

type Props = {
    show: boolean
    close: () => void
    title?: string | ReactElement
    customClass?: string
    size?: ModalProps['size']
    useBody?: boolean
}

export const BasicModal: FC<PropsWithChildren<Props>> = (
    {
        show,
        close,
        title,
        customClass,
        size,
        useBody = true,
        children
    }
) => {
    const {isDarkMode} = useDarkMode()
    return <Modal
        show={show}
        onHide={close}
        centered
        size={size}
        className={`basic-modal ${customClass ?? ''}`}
    >
        <Modal.Header closeButton data-bs-theme={isDarkMode ? 'dark' : 'light'}>
            {title && <Modal.Title>{title}</Modal.Title>}
        </Modal.Header>
        {useBody
            ? <Modal.Body className="text-center">
                {children}
            </Modal.Body>
            : children
        }
    </Modal>
}