import GamesClient from '@clients/Games'
import {
    ActiveAlliesAndEnemiesState,
    AlliesAndEnemiesState,
    ViewingPlayerState,
} from '@games/AlliesAndEnemies'
import { IPlayer, PlayerId } from '@entities/Player'
import { GameId } from '@entities/Game'
import { DescriptiveError } from '@shared/api'

export type ActiveViewingPlayerState = {
    state: ActiveAlliesAndEnemiesState
    viewingPlayer: ViewingPlayerState
}

export abstract class BaseAlliesAndEnemiesResolver {
    protected async getActiveViewingPlayerState({
        gameId,
        playerId,
    }: {
        gameId: GameId
        playerId: PlayerId
    }): Promise<ActiveViewingPlayerState> {
        const state = await GamesClient.state.get<AlliesAndEnemiesState>(gameId)
        if (!state) {
            throw new DescriptiveError(
                'Unable to look up game state.',
                'No state data for this game found.'
            )
        }
        const activeState = new ActiveAlliesAndEnemiesState(state, playerId)
        const viewingPlayer = activeState
            .players()
            .find((p) => p.id === playerId)
        if (!viewingPlayer) {
            throw new DescriptiveError(
                'Unable to look up viewing player state.',
                'No player state data for this game state found.'
            )
        }
        return {
            state: activeState,
            viewingPlayer,
        }
    }
}
