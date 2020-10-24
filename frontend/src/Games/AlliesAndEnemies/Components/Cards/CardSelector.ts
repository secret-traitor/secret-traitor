import { PlayerState } from 'Games/AlliesAndEnemies/types'

export type Selectable = {
    onSubmit: (player: PlayerState) => void
    disabledForPositions: number[]
    label?: string
}
