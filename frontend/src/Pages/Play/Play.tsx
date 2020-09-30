import React from 'react'

import GameManager from 'GameManager'
import { usePageTitle } from '../../hooks'

const Play: React.FC<{
    playerCode: string
    gameCode: string
}> = (props) => {
    usePageTitle('Play | Secret Traitor')
    return <GameManager {...props} />
}

export default Play
