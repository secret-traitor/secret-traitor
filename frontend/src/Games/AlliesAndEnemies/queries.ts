import { gql } from 'apollo-boost'

export const AlliesAndEnemiesGameStateFragment = gql`
    fragment BoardRowFragment on BoardRow {
        cards {
            suit
        }
        maxCards
    }
    fragment AlliesAndEnemiesPlayerFragment on AlliesAndEnemiesPlayer {
        id
        nickname
        position
        role
    }
    fragment AlliesAndEnemiesGameStateFragment on AlliesAndEnemiesGameState {
        playId
        players {
            ...AlliesAndEnemiesPlayerFragment
        }
        viewingPlayer {
            ...AlliesAndEnemiesPlayerFragment
        }
        board {
            actions
            ally {
                ...BoardRowFragment
            }
            enemy {
                ...BoardRowFragment
            }
        }
        currentTurn {
            number
            status
            position
            currentPlayer {
                ...AlliesAndEnemiesPlayerFragment
            }
            nominatedPlayer {
                ...AlliesAndEnemiesPlayerFragment
            }
            disabledNominations {
                ...AlliesAndEnemiesPlayerFragment
            }
        }
    }
`
