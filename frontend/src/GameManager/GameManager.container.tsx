import React from 'react'

import AlliesNEnemies from 'Games/AlliesNEnemies'
import { GameState } from 'types/Game'

const GameManagerContainer: React.FC<GameState> = (props) => {
    return <AlliesNEnemies {...props} />
}

export default GameManagerContainer
