import { gql } from 'apollo-boost'
import { GameResult } from './types'
import { usePollingQuery } from '../../hooks'

const GAMES_QUERY = gql`
    query joinableGames {
        games: joinableGames {
            id
            code
            status
        }
    }
`
export const usePollGames = (): [GameResult[], boolean, any, () => void] => {
    const { data, loading, error, refetch } = usePollingQuery(GAMES_QUERY, {
        fetchPolicy: 'no-cache',
    })
    const games: GameResult[] = data?.games as GameResult[]
    return [games, loading, error, refetch]
}
