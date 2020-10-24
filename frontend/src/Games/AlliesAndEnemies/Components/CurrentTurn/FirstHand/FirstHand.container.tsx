import React from 'react'

import {
    AlliesAndEnemiesState,
    Card,
    CardSuit,
} from 'Games/AlliesAndEnemies/types'
import FirstHandComponent from './FirstHand.component'

const FirstHand: React.FC<AlliesAndEnemiesState> = ({ currentTurn }) => {
    const discardFn = (position: number) => {
        // TODO: Implement first hand mutation
        console.log('FirstHand', position)
    }
    // const cards = currentTurn.firstHand
    const cards: [Card, Card, Card] = [
        { suit: CardSuit.Ally },
        { suit: CardSuit.Enemy },
        { suit: CardSuit.Ally },
    ]
    return <FirstHandComponent cards={cards} discard={discardFn} />
}

export default FirstHand
