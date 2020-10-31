import React from 'react'

import HeaderComponent from './Header.component'

type HeaderContainerProps = {
    size: string
}

const HeaderContainer: React.FC<HeaderContainerProps> = (props) => (
    <HeaderComponent {...props} />
)

export default HeaderContainer
