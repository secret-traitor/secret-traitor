import React from 'react'

import {
    AlliesAndEnemiesState,
    Card,
    CardSuit,
} from 'Games/AlliesAndEnemies/types'
import SecondHandComponent from './SecondHand.component'

const SecondHand: React.FC<AlliesAndEnemiesState> = ({ currentTurn }) => {
    const discardFn = (position: number) => {
        // TODO: Implement second hand mutation
        console.log('SecondHand', position)
    }
    // const cards = currentTurn.secondHand
    const cards: [Card, Card] = [
        { suit: CardSuit.Ally },
        { suit: CardSuit.Enemy },
    ]
    return <SecondHandComponent cards={cards} discard={discardFn} />
}

export default SecondHand
