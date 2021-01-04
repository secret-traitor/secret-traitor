import React from 'react'
import { Box, BoxProps, Layer, LayerProps } from 'grommet'

type PopupProps = BoxProps & LayerProps & { onClose?: () => void }

const Popup: React.FC<PopupProps> = ({
    children,
    onClose = () => ({}),
    ...props
}) => (
    <Layer
        position="center"
        onClickOutside={onClose}
        {...(props as LayerProps)}
    >
        <Box
            pad="large"
            gap="medium"
            background="light-1"
            round="small"
            {...(props as BoxProps)}
        >
            {children}
        </Box>
    </Layer>
)

export default Popup
