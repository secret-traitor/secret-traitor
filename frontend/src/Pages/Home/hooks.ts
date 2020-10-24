import { gql } from 'apollo-boost'

import { usePollingQuery } from 'hooks'
import { Game } from 'types/Game'
import { QueryResult } from '@apollo/react-hooks'

const GAMES_QUERY = gql`
    query joinableGames {
        games: joinableGames {
            id
            status
            type
        }
    }
`
export const usePollGames = (): QueryResult & { games: Game[] } => {
    const result = usePollingQuery(GAMES_QUERY, {
        fetchPolicy: 'no-cache',
    })
    const games: Game[] = result.data?.games as Game[]
    return { ...result, games }
}
