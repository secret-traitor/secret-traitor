import React from 'react'

import AlliesAndEnemies from 'Games/AlliesAndEnemies'
import { GameState } from 'Types/Game'

const GameManagerContainer: React.FC<GameState> = (props) => {
    return <AlliesAndEnemies {...props} />
}

export default GameManagerContainer
