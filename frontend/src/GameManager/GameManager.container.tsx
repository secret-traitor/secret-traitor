import React from 'react'

import AlliesNEnemies from 'Games/AlliesNEnemies'

type GameManagerContainerProps = {
    playerCode: string
    gameCode: string
}

const GameManagerContainer: React.FC = () => {
    return <AlliesNEnemies />
}

export default GameManagerContainer
