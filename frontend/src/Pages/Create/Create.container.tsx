import React from 'react'
import { Redirect } from 'react-router-dom'

import LoadingScreen from 'Components/LoadingScreen'
import { getJoinUrl } from 'links'
import { usePageTitle } from 'hooks'
import { usePlayerId } from 'types/Player'

import Create from './Create.component'
import { useCreateGame, useGameTypes } from './hooks'

const CreateContainer = () => {
    usePageTitle('Create | Secret Traitor')
    const {
        gameTypes,
        loading: loadingGameTypes,
        error: errorGameTypes,
    } = useGameTypes()
    const playerId = usePlayerId()
    const [
        create,
        {
            called: calledCreate,
            data: dataCreate,
            error: errorCreate,
            loading: loadingCreate,
            game,
        },
    ] = useCreateGame(playerId)
    const loading =
        (loadingCreate || loadingGameTypes) && !(errorCreate || errorGameTypes)

    if (calledCreate && dataCreate) {
        if (game?.id) {
            return <Redirect to={getJoinUrl({ gameId: game.id })} />
        }
    }
    if (errorCreate) {
        return <>Uh oh!</>
    }
    return (
        <>
            {loading && <LoadingScreen />}
            <Create create={create} descriptions={gameTypes} />
        </>
    )
}

export default CreateContainer
