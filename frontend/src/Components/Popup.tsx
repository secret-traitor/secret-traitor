import React from 'react'
import { Box, BoxProps, Layer, LayerPositionType } from 'grommet'

type PopupProps = BoxProps & {
    position?: LayerPositionType
    onClose?: () => void
}

const Popup: React.FC<PopupProps> = ({
    children,
    onClose,
    position = 'center',
    ...props
}) => (
    <Layer position={position} onClickOutside={onClose}>
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
