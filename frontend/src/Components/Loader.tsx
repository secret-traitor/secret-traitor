import React from 'react'
import { Box, Layer } from 'grommet'
import { SemipolarSpinner as Spinner } from 'react-epic-spinners'

import theme from 'theme'

const color: string | any = theme.global?.colors?.['brand-3'] || 'black'

export const LoadingScreen = () => (
    <Layer>
        <Box pad="large" gap="medium" background={{ opacity: 'weak' }}>
            <Loader />
        </Box>
    </Layer>
)

export const Loader = () => <Spinner color={color} />
