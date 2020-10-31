import React from 'react'
import { Redirect } from 'react-router'

import LoadingScreen from 'Components/LoadingScreen'
import { getPlayUrl } from 'links'
import { SuccessToast } from 'Components/Toast'

export const JoiningGameRedirect: React.FC<{
    playerId: string
    gameId: string
}> = ({ playerId, gameId }) => (
    <>
        <SuccessToast position="top">Joining game...</SuccessToast>
        <LoadingScreen />
        <Redirect to={getPlayUrl({ playerId, gameId })} />
    </>
)
