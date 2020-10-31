import React from 'react'

import PageBody from './PageBody.component'

type PageBodyContainerProps = {
    size: string
}

const PageBodyContainer: React.FC<PageBodyContainerProps> = (props) => (
    <PageBody {...props} />
)

export default PageBodyContainer
