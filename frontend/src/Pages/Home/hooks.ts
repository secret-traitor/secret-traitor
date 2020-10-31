import { gql } from 'apollo-boost'

import { usePollingQuery } from 'hooks'
import { Game } from 'types/Game'
import { QueryResult } from '@apollo/react-hooks'

const GamesQuery = gql`
    query joinableGames {
        games: joinableGames {
            id
            status
            type
        }
    }
`
export const usePollGames = (): QueryResult & { games: Game[] } => {
    const result = usePollingQuery(GamesQuery, {
        fetchPolicy: 'no-cache',
    })
    const games: Game[] = result.data?.games as Game[]
    return { ...result, games }
}
