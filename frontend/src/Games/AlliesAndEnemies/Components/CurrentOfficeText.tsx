import React from 'react'
import { Text } from 'grommet'

import { CurrentOffice } from 'Games/AlliesAndEnemies/types'

export const CurrentOfficeText: React.FC<{
    office?: CurrentOffice
}> = ({ office }) => {
    if (office === 'president') {
        return <Text weight="bold">President</Text>
    }
    if (office === 'governor') {
        return <Text weight="bold">Governor</Text>
    }
    return <Text />
}
