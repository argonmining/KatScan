import React, {FC, PropsWithChildren} from "react";
import {Button, ButtonProps} from "react-bootstrap";
import './BasicButton.css'

type Props = {
    onClick: () => void
    disabled?: boolean
    variant?: ButtonProps['variant']
    size?: ButtonProps['size']
}

export const BasicButton: FC<PropsWithChildren<Props>> = (
    {
        onClick,
        disabled = false,
        variant,
        size,
        children
    }
) => {
    return <Button
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        size={size}
        className={'basic-button'}
    >
        {children}
    </Button>
}