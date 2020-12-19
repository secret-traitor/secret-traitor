import React from 'react'
import { ButtonProps } from 'grommet'

import { RouterButton } from 'Components/RouterButton'

export const getHomeUrl = () => '/'
export const HomeRouterButton: React.FC<ButtonProps> = ({
    children,
    ...props
}) => (
    <RouterButton {...(props as ButtonProps)} path={getHomeUrl()}>
        {children}
    </RouterButton>
)

export const getCreateUrl = (): string => '/create'

export const CreateRouterButton: React.FC<ButtonProps> = ({
    children,
    ...props
}) => (
    <RouterButton {...(props as ButtonProps)} path={getCreateUrl()}>
        {children}
    </RouterButton>
)

export type PlayProps = {
    gameId: string
    playerId: string
}
export const getPlayUrl = (args: PlayProps): string =>
    `/play/${args.gameId}/${args.playerId}`
export const PlayRouterButton: React.FC<ButtonProps & PlayProps> = ({
    children,
    ...props
}) => (
    <RouterButton
        {...(props as ButtonProps)}
        path={getPlayUrl({ ...(props as PlayProps) })}
    >
        {children}
    </RouterButton>
)

const baseUrl = process.env.REACT_APP_URL || window.location.href.slice(0, -1)

export const createAbsolutePath = (...paths: string[]) =>
    [baseUrl, ...paths].join('')
