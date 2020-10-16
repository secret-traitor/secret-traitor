import get from 'lodash/get'
import React from 'react'
import { gql } from 'apollo-boost'
import { Redirect } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/react-hooks'

import LoadingScreen from 'Components/LoadingScreen'
import { GameDescription } from 'types/GameDescription'
import { GameType } from 'types/Game'
import { getJoinUrl } from 'links'
import { usePageTitle } from 'hooks'
import { usePlayerCode } from 'types/Player'

import Create from './Create.component'

const GAME_TYPES_QUERY = gql`
    query gameTypes {
        gameTypes {
            type
            displayName
            description
        }
    }
`

const useGameTypes = (): [GameDescription[], boolean, any] => {
    const results = useQuery(GAME_TYPES_QUERY)
    const { data, loading, error } = results
    const gameTypes = data?.gameTypes as GameDescription[]
    return [gameTypes, loading, error]
}

const CREATE_MUTATION = gql`
    mutation createGame($playerCode: String!, $gameType: GameType!) {
        game: createGame(playerCode: $playerCode, gameType: $gameType) {
            code
        }
    }
`

const useCreateGame = (playerCode: string) => {
    const [createMutation, { called, loading, error, data }] = useMutation(
        CREATE_MUTATION
    )
    const create = (type: GameType) =>
        createMutation({
            variables: { playerCode, gameType: type },
        })
    return { create, called, data, error, loading }
}

const CreateContainer = () => {
    usePageTitle('Create | Secret Traitor')
    const [gameDescriptions, loadingGameTypes, errorGameTypes] = useGameTypes()
    const playerCode = usePlayerCode()
    const {
        create,
        called: calledCreate,
        data: dataCreate,
        error: errorCreate,
        loading: loadingCreate,
    } = useCreateGame(playerCode)
    if (
        (loadingCreate || loadingGameTypes) &&
        !(errorCreate || errorGameTypes)
    ) {
        return <LoadingScreen />
    }
    if (calledCreate && dataCreate) {
        const gameCode = get(dataCreate, 'game.code')
        if (gameCode) {
            return <Redirect to={getJoinUrl({ gameCode })} />
        }
    }
    if (errorCreate) {
        return <>Uh oh!</>
    }
    return <Create create={create} descriptions={gameDescriptions} />
}

/*
[
                ...descriptions,
                {
                    displayName: 'Game Title',
                    gameClass: GameType.DemoType,
                    description: 'Description of game.',
                },
                {
                    displayName: 'Another Game Title',
                    gameClass: GameType.AnotherDemoType,
                    description: 'Description of another game.',
                },
            ]
 */

export default CreateContainer
