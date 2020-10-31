import React from 'react'
import { SemipolarSpinner as Spinner } from 'react-epic-spinners'

import theme from 'theme'

const color: string | any = theme.global?.colors?.['brand-3'] || 'black'
const Loader = () => <Spinner color={color} />

export default Loader
