import React from 'react'
import { gql } from 'apollo-boost'
import { Redirect } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'

import LoadingScreen from 'Components/LoadingScreen'
import { getJoinUrl } from 'links'
import { usePageTitle } from 'hooks'
import { usePlayerCode } from 'types/Player'

import Create from './Create.component'
import { GameClass, GameType } from '../../types/GameType'

const GAME_TYPES_QUERY = gql`
    query gameTypes {
        gameTypes {
            gameClass
            displayName
            description
        }
    }
`

const useGameTypes = (): [any, boolean, any] => {
    const results = useQuery(GAME_TYPES_QUERY)
    const { data, loading, error } = results
    const gameTypes: GameType[] = data?.gameTypes as GameType[]
    return [gameTypes, loading, error]
}

const CREATE_MUTATION = gql`
    mutation createGame($playerCode: String!, $gameClass: GameClass!) {
        game: createGame(
            input: { playerCode: $playerCode, gameClass: $gameClass }
        ) {
            code
        }
    }
`

const useCreateGame = (playerCode: string) => {
    const [createMutation, { called, loading, error, data }] = useMutation(
        CREATE_MUTATION
    )
    const create = (gameClass: GameClass) =>
        createMutation({
            variables: { playerCode, gameClass },
        })
    return { create, called, data, error, loading }
}

const CreateContainer = () => {
    usePageTitle('Create | Secret Traitor')
    const [gameTypes, loadingGameTypes, errorGameTypes] = useGameTypes()
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
    return <Create create={create} gameTypes={gameTypes} />
}

/*
[
                ...gameTypes,
                {
                    displayName: 'Game Title',
                    gameClass: GameClass.DemoType,
                    description: 'Description of game.',
                },
                {
                    displayName: 'Another Game Title',
                    gameClass: GameClass.AnotherDemoType,
                    description: 'Description of another game.',
                },
            ]
 */

export default CreateContainer
