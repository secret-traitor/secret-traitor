import { InterfaceType } from 'type-graphql'

import { PlayerId } from '@entities/Player'
import { GameId } from '@entities/Game'
import { Event } from '@graphql/Event'

@InterfaceType({
    resolveType: (args: PlayEvent) => {
        console.log('PlayEvent resolveType', args)
        return args.type
    },
})
export abstract class PlayEvent extends Event {
    readonly playerId: PlayerId

    readonly gameId: GameId
}
