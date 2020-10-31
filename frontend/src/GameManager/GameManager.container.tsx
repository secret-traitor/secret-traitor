import React from 'react'

import AlliesAndEnemies from 'Games/AlliesAndEnemies'
import { GameState } from 'types/Game'

const GameManagerContainer: React.FC<GameState> = (props) => {
    return <AlliesAndEnemies {...props} />
}

export default GameManagerContainer
