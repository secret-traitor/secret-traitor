import { DataSource } from 'apollo-datasource'
import DataLoader from 'dataloader'

import GamesClient from 'src/clients/Games'
import Context from 'src/shared/Context'
import { GameId } from 'src/entities/Game'
import { PlayerId } from 'src/entities/Player'

import { AlliesAndEnemiesState } from './AlliesAndEnemies.types'
import { ActiveAlliesAndEnemiesState } from './AlliesAndEnemies.game'
import { StandardConfiguration } from './AlliesAndEnemies.config'
import { DescriptiveError } from 'src/shared/api'

class AlliesAndEnemiesStateDataSource extends DataSource<Context> {
    private loader = new DataLoader<GameId, AlliesAndEnemiesState>(
        async (keys) => {
            const results: any[] = await GamesClient.state.list([...keys])
            const reduced: Record<
                string,
                AlliesAndEnemiesState
            > = results.reduce(
                (acc, s) => ({
                    ...acc,
                    [s.gameId]: s,
                }),
                {}
            )
            return keys.map((k) => reduced[k] || undefined)
        }
    )
    async delete(gameId: GameId): Promise<any> {
        return await GamesClient.state.delete(gameId)
    }
    async exists(gameId: GameId): Promise<boolean> {
        const state = await this.loader.load(gameId)
        return !!state
    }
    async load(
        gameId: GameId,
        playerId: PlayerId
    ): Promise<ActiveAlliesAndEnemiesState> {
        const state = await this.loader.load(gameId)
        if (!state) {
            throw new DescriptiveError(
                'Unable to look up game state.',
                'No state data for this game found.'
            )
        }
        return new ActiveAlliesAndEnemiesState(state, playerId)
    }
    async start(gameId: GameId, playerId: PlayerId) {
        const players = await GamesClient.players.scan({
            PK: {
                ComparisonOperator: 'CONTAINS',
                AttributeValueList: [gameId],
            },
            Name: { ComparisonOperator: 'NOT_NULL' },
        })
        if (!players) {
            throw new DescriptiveError('no players')
        }
        const configuration = StandardConfiguration[players.length] || null
        if (!configuration) {
            throw new DescriptiveError('no configuration')
        }
        const state = ActiveAlliesAndEnemiesState.newGame(
            gameId,
            players,
            configuration,
            playerId
        )
        await state.save()
    }
}
export default AlliesAndEnemiesStateDataSource
