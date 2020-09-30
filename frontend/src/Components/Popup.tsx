import React from 'react'
import { Box, BoxProps, Layer, LayerPositionType } from 'grommet'

type PopupProps = BoxProps & {
    position: LayerPositionType
    onClose: () => void
}

const Popup: React.FC<PopupProps> = ({
    children,
    onClose,
    position,
    ...props
}) => (
    <Layer position="top" onClickOutside={onClose}>
        <Box pad="large" gap="medium" {...(props as BoxProps)}>
            {children}
        </Box>
    </Layer>
)

export default Popup
