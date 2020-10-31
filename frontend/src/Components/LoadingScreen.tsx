import { Box, Layer } from 'grommet'
import React from 'react'
import Loader from './Loader'

export const LoadingScreen = () => (
    <Layer responsive={false}>
        <Box pad="large" gap="medium" background={{ opacity: 'weak' }}>
            <Loader />
        </Box>
    </Layer>
)

export default LoadingScreen
