import React from 'react'
import { SemipolarSpinner as Spinner } from 'react-epic-spinners'

import theme from 'theme'

const defaultColor: string | any = theme.global?.colors?.['brand-3'] || 'black'
const Loader: React.FC<{ color?: string }> = ({ color }) => (
    <Spinner
        color={
            (color && theme.global?.colors?.[color]) || color || defaultColor
        }
    />
)

export default Loader
