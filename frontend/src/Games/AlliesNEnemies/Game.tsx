import React from 'react'
import { Box, Main, Text } from 'grommet'
import { Accessibility, Close, Notes, View, Trophy } from 'grommet-icons'

import Section from 'Components/Box'

import { AlliesAndEnemiesState, BoardAction, CardSuit } from './types'
import { CardRow } from './Cards'

const mapIcon = (action: BoardAction) => {
    console.log(action)
    switch (action) {
        case BoardAction.Execution:
            return <Close size="large" />
        case BoardAction.InvestigateLoyalty:
            return <Accessibility size="large" />
        case BoardAction.PolicyPeak:
            return <View size="large" />
        case BoardAction.SpecialElection:
            return <Notes size="large" />
        default:
            return undefined
    }
}

const Game: React.FC<AlliesAndEnemiesState> = (props) => {
    const allyCards = Array(props.board.ally.maxCards)
        .fill({})
        .map((_, index) => ({
            active: index < 2, //!!props.board.ally.cards[index],
            icon:
                index === props.board.ally.maxCards - 1 ? (
                    <Trophy size="large" />
                ) : undefined,
            suit: CardSuit.Ally,
        }))

    const enemyCards = Array(props.board.enemy.maxCards)
        .fill({})
        .map((_, index) => {
            const c = {
                active: index < 4, //!!props.board.enemy.cards[index],
                icon:
                    index === props.board.enemy.maxCards - 1 ? (
                        <Trophy size="large" />
                    ) : (
                        mapIcon(props.board.actions[index])
                    ),
                suit: CardSuit.Enemy,
            }
            console.log(c)
            return c
        })

    console.log({ allyCards, enemyCards })

    return (
        <>
            <Main fill flex align="center" justify="center">
                <Box flex pad="medium" width="large" gap="small">
                    <Section
                        align="center"
                        height={{ min: 'xsmall', max: 'large' }}
                        justify="center"
                    >
                        <Text>
                            Waiting on{' '}
                            {props.player.id === props.currentTurn.waitingOn.id
                                ? 'you!'
                                : props.currentTurn.waitingOn.nickname}
                        </Text>
                    </Section>
                    <Section
                        align="center"
                        height={{ min: 'xsmall', max: 'large' }}
                        justify="center"
                        gap="small"
                    >
                        <Box
                            align="stretch"
                            direction="row"
                            fill="horizontal"
                            flex
                            justify="between"
                        >
                            <CardRow cards={allyCards} />
                        </Box>
                        <Box
                            align="stretch"
                            direction="row"
                            fill="horizontal"
                            flex
                            justify="between"
                        >
                            <CardRow cards={enemyCards} />
                        </Box>
                    </Section>
                </Box>
            </Main>
        </>
    )
}

export default Game
