import { ErrorType } from 'Pages/Error/Page'

export const homePath = '/'
export const getHomeUrl = (): string => homePath

export const playPath = '/play/:gameId/:playerId'
export const getPlayUrl = (gameId: string, playerId: string): string =>
    playPath.replace(':gameId', gameId).replace(':playerId', playerId)

export const errorPath = '/oops'
export const getErrorUrl = (type?: ErrorType): string =>
    type ? [errorPath, `?type=${type}`].join('/') : errorPath
