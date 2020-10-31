import { BoardAction } from './AlliesAndEnemies.types'

export type ConfigurationOptions = {
    actions: BoardAction[]
    players: {
        allies: number
        enemies: number
    }
    deck: {
        enemyCards: number
        allyCards: number
    }
    enableVeto: number
    leaderIsSecret: boolean
    victory: {
        allyCards: number
        election: number
        enemyCards: number
    }
}

export type Configuration = {
    [count: number]: ConfigurationOptions
}

const DefaultConfiguration = {
    deck: {
        allyCards: 6,
        enemyCards: 11,
    },
    victory: {
        allyCards: 5,
        election: 3,
        enemyCards: 6,
    },
    enableVeto: 5,
}

export const StandardConfiguration: Configuration = {}
StandardConfiguration[5] = {
    ...DefaultConfiguration,
    players: {
        allies: 3,
        enemies: 1,
    },
    actions: [
        BoardAction.None,
        BoardAction.None,
        BoardAction.PolicyPeek,
        BoardAction.Execution,
        BoardAction.Execution,
    ],
    leaderIsSecret: false,
}
StandardConfiguration[6] = {
    ...StandardConfiguration[5],
    players: {
        allies: 4,
        enemies: 1,
    },
}
StandardConfiguration[7] = {
    ...DefaultConfiguration,
    players: {
        allies: 4,
        enemies: 2,
    },
    actions: [
        BoardAction.None,
        BoardAction.InvestigateLoyalty,
        BoardAction.SpecialElection,
        BoardAction.Execution,
        BoardAction.Execution,
    ],
    leaderIsSecret: true,
}
StandardConfiguration[8] = {
    ...StandardConfiguration[7],
    players: {
        allies: 5,
        enemies: 2,
    },
}
StandardConfiguration[9] = {
    ...DefaultConfiguration,
    players: {
        allies: 5,
        enemies: 3,
    },
    actions: [
        BoardAction.InvestigateLoyalty,
        BoardAction.InvestigateLoyalty,
        BoardAction.SpecialElection,
        BoardAction.Execution,
        BoardAction.Execution,
    ],
    leaderIsSecret: true,
}
StandardConfiguration[10] = {
    ...StandardConfiguration[9],
    players: {
        allies: 9,
        enemies: 3,
    },
}
