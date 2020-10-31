import 'reflect-metadata'
import range from 'lodash/range'
import shuffle from 'lodash/shuffle'
import { inject } from '../../server/container'

import { IAlliesAndEnemiesDao } from '@daos/AlliesAndEnemies'
import { IGameDao } from '@daos/Game'
import { IGamePlayerDao } from '@daos/GamePlayer'
import { IPlayerDao } from '@daos/Player'

import { GameId } from '@entities/Game'
import { IPlayer } from '@entities/Player'

import { IGameManager, Start } from '@games/GameManager'

import { DescriptiveError } from '@shared/api'

import { StandardConfiguration } from './AlliesAndEnemies.config'
import { Faction, PlayerRole, PlayerState } from './AlliesAndEnemies.types'

export class AlliesAndEnemiesGameManager implements IGameManager {
    private readonly gamePlayerDao = inject<IGamePlayerDao>('GamePlayers')
    private readonly gameDao = inject<IGameDao>('Games')
    private readonly playerDao = inject<IPlayerDao>('Players')
    private readonly alliesAndEnemiesDao = inject<IAlliesAndEnemiesDao>(
        'AlliesAndEnemies'
    )

    constructor(private readonly gameId: GameId) {
        this.gameId = gameId
    }

    async exists(): Promise<boolean> {
        const state = await this.alliesAndEnemiesDao.get({
            gameId: this.gameId,
        })
        return !!state
    }

    async start(args: Start): Promise<boolean> {
        const gamePlayers = await this.gamePlayerDao.find({
            gameId: this.gameId,
        })
        if (!gamePlayers) {
            throw new DescriptiveError('no players for game')
        }
        const playerIds = gamePlayers.map(({ playerId }) => playerId)
        let players = await this.playerDao.list({ ids: playerIds })
        if (!players) {
            throw new DescriptiveError('no players')
        }
        players = players.filter((p) => p.nickname)
        const configuration = StandardConfiguration[players.length] || null
        if (!configuration) {
            throw new DescriptiveError('no configuration')
        }
        try {
            const state = await this.alliesAndEnemiesDao.new({
                gameId: this.gameId,
                leaderIsSecret: configuration.leaderIsSecret,
                deck: buildDeck(
                    configuration.deck.allyCards,
                    configuration.deck.enemyCards
                ),
                players: buildPlayers(players, configuration.players.enemies),
                config: configuration,
            })
            return !!state
        } catch (Error) {
            const state = await this.alliesAndEnemiesDao.get({
                gameId: this.gameId,
            })
            return !!state
        }
    }
}

const buildPlayers = (players: IPlayer[], enemies: number): PlayerState[] => {
    if (players.length / 2 < enemies + 1) {
        throw new DescriptiveError(
            'Invalid game configuration.',
            `You can not have ${enemies} enemies for ${players.length} players.`
        )
    }
    const roles = shuffle([
        PlayerRole.EnemyLeader,
        ...range(enemies).map(() => PlayerRole.Enemy),
        ...range(players.length - enemies - 1).map(() => PlayerRole.Ally),
    ])
    return shuffle(players).map((player, position) => ({
        ...player,
        role: roles[position],
        position,
    }))
}

export const buildDeck = (allyCards: number, enemyCards: number) =>
    shuffle([
        ...new Array(allyCards).fill({ suit: Faction.Ally }),
        ...new Array(enemyCards).fill({ suit: Faction.Enemy }),
    ])
