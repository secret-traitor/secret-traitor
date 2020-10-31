import shuffle from 'lodash/shuffle'

import { PlayerRole, PlayerState } from '@games/AlliesAndEnemies'

export const buildPlayers = (
    allyCount: number,
    enemyCount: number,
    leaderCount: number = 1,
    shufflePlayers: boolean = false
) => {
    const total = allyCount + enemyCount
    const allies = new Array(allyCount).fill({}).map(
        (_, i) =>
            ({
                position: i,
                role: PlayerRole.Ally,
                id: i.toString(),
                nickname: i.toString(),
            } as PlayerState)
    )
    const enemies = new Array(enemyCount).fill({}).map(
        (_, i) =>
            ({
                position: i + allyCount,
                role: PlayerRole.Enemy,
                id: (i + allyCount).toString(),
                nickname: (i + allyCount).toString(),
            } as PlayerState)
    )
    const leaders = new Array(enemyCount).fill({}).map(
        (_, i) =>
            ({
                position: i + total,
                role: PlayerRole.EnemyLeader,
                id: (i + total).toString(),
                nickname: (i + total).toString(),
            } as PlayerState)
    )
    const players = [...allies, ...enemies, ...leaders]
    return shufflePlayers ? shuffle(players) : players
}
