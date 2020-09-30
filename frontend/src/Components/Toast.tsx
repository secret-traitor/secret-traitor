import React from 'react'
import { Box, BoxProps, Button, Layer, LayerPositionType } from 'grommet'
import { Close } from 'grommet-icons'

export type ToastProps = {
    onClose?: () => void
    time?: number
    position?: LayerPositionType
}

export const Toast: React.FC<BoxProps & ToastProps> = ({
    children,
    onClose = () => {},
    time = 1000,
    position = 'bottom',
    ...props
}) => {
    // TODO: add auto close timer
    return (
        <Layer
            modal={false}
            full="horizontal"
            position={position}
            animate
            onClickOutside={onClose}
        >
            <Box {...props}>
                {children}
                <Button icon={<Close />} onClick={onClose} />
            </Box>
        </Layer>
    )
}

export const SuccessToast: React.FC<ToastProps> = (props) => (
    <Toast
        {...props}
        background="status-ok"
        pad="small"
        direction="row"
        justify="between"
        align="center"
    />
)

export const ErrorToast: React.FC<ToastProps> = (props) => (
    <Toast
        {...props}
        background="status-error"
        pad="small"
        direction="row"
        justify="between"
        align="center"
    />
)
