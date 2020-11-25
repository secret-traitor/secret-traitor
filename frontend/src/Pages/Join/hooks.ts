import { gql } from 'apollo-boost'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { MutationResult, QueryResult } from '@apollo/react-common'
import { ExecutionResult } from '@apollo/react-common'

import { Game } from 'types/Game'
import { Player } from 'types/Player'

const GamePlayersMutation = gql`
    query gameWithPlayers($gameId: ID!) {
        game(id: $gameId) {
            id
            status
            type
            players {
                id
                nickname
            }
        }
    }
`

export const useGameWithPlayers = (
    gameId: string,
    playerId: string
): QueryResult & { game?: Game; player?: Player } => {
    const result = useQuery(GamePlayersMutation, {
        variables: { gameId, playerId },
        fetchPolicy: 'no-cache',
    })
    return {
        ...result,
        game: result.data?.game as Game,
        player: result.data?.game?.players?.find(
            (player: Player) => player.id === playerId
        ),
    }
}

const JoinGameMutation = gql`
    mutation joinGame(
        $gameId: String!
        $playerId: String!
        $playerNickname: String!
    ) {
        joinGame(
            gameId: $gameId
            playerId: $playerId
            playerNickname: $playerNickname
        ) {
            game {
                id
                status
                type
                players {
                    id
                    nickname
                }
            }
        }
    }
`

export type JoinGameProps = {
    gameId: string
    playerId: string
    playerNickname: string
}

export const useJoinGame = (): [
    (variables: JoinGameProps) => Promise<ExecutionResult>,
    MutationResult
] => {
    const [createMutation, results] = useMutation(JoinGameMutation)
    const join = (variables: JoinGameProps) => createMutation({ variables })
    return [join, results]
}
