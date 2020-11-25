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
        status
    }
    fragment AlliesAndEnemiesGameStateFragment on AlliesAndEnemiesGameState {
        gameId
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
            action
            consecutiveFailedElections
            elected
            enableVeto
            firstHand {
                suit
            }
            ineligibleNominations {
                ...AlliesAndEnemiesPlayerFragment
            }
            nominatedPlayer {
                ...AlliesAndEnemiesPlayerFragment
            }
            number
            position
            secondHand {
                suit
            }
            specialElection
            status
            waitingOn {
                ...AlliesAndEnemiesPlayerFragment
            }
        }
        victoryStatus {
            message
            team
            type
        }
    }
`

export const AlliesAndEnemiesGameEventFragment = gql`
    fragment AlliesAndEnemiesGameEventFragment on GameEvent {
        ... on AlliesAndEnemiesExecutePlayer {
            executedPlayer {
                ...AlliesAndEnemiesPlayerFragment
            }
        }
        ... on AlliesAndEnemiesNominationEvent {
            nomination {
                ...AlliesAndEnemiesPlayerFragment
            }
        }
        ... on AlliesAndEnemiesSpecialElectionEvent {
            specialElectedPlayer {
                ...AlliesAndEnemiesPlayerFragment
            }
        }
        ... on AlliesAndEnemiesVoteEvent {
            vote
        }
        ... on AlliesAndEnemiesVetoVoteEvent {
            vote
        }
    }
`
