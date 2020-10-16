import { BoardActionType } from './AlliesAndEnemies.types'

export type ConfigurationOptions = {
    leaderIsSecret: boolean
    actions: BoardActionType[]
    deck: {
        totalCards: number
        allyCards: number
    }
    victory: {
        allyCards: number
        election: number
        enemyCards: number
    }
    enemies: number
}

export type Configuration = {
    [count: number]: ConfigurationOptions
}

const DefaultConfiguration = {
    enemyCards: 7,
    deck: {
        totalCards: 17,
        allyCards: 6,
    },
    victory: {
        allyCards: 5,
        election: 3,
        enemyCards: 6,
    },
}

export const StandardConfiguration: Configuration = {}
StandardConfiguration[5] = {
    ...DefaultConfiguration,
    actions: [
        BoardActionType.None,
        BoardActionType.None,
        BoardActionType.PolicyPeak,
        BoardActionType.Execution,
        BoardActionType.Execution,
    ],
    leaderIsSecret: false,
    enemies: 1,
}
StandardConfiguration[6] = StandardConfiguration[5]
StandardConfiguration[7] = {
    ...DefaultConfiguration,
    actions: [
        BoardActionType.None,
        BoardActionType.InvestigateLoyalty,
        BoardActionType.SpecialElection,
        BoardActionType.Execution,
        BoardActionType.Execution,
    ],
    leaderIsSecret: true,
    enemies: 2,
}
StandardConfiguration[8] = StandardConfiguration[7]
StandardConfiguration[9] = {
    ...DefaultConfiguration,
    actions: [
        BoardActionType.InvestigateLoyalty,
        BoardActionType.InvestigateLoyalty,
        BoardActionType.SpecialElection,
        BoardActionType.Execution,
        BoardActionType.Execution,
    ],
    leaderIsSecret: true,
    enemies: 3,
}
StandardConfiguration[10] = StandardConfiguration[9]
