import { gql } from 'apollo-boost'

import { Game } from 'types/Game'
import { QueryResult } from '@apollo/react-common'
import { usePollingQuery } from '../../hooks/apollo'

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
