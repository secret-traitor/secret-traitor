import React from 'react'
import { Box, Main, Text } from 'grommet'
import { Accessibility, Close, Notes, View, Trophy } from 'grommet-icons'

import Section from 'Components/Box'

import { AlliesAndEnemiesState, BoardAction, BoardRow, CardSuit } from './types'
import { PolicyCardRow } from './PolicyCard'
import { TeamDetails } from './TeamDetails'

const mapIcon = (action: BoardAction) => {
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

const mapEnemyCards = (row: BoardRow, actions: BoardAction[]) =>
    Array(row.maxCards)
        .fill({})
        .map((_, index) => ({
            active: !!row.cards[index],
            icon:
                index === row.maxCards - 1 ? (
                    <Trophy size="large" />
                ) : (
                    mapIcon(actions[index])
                ),
            suit: CardSuit.Enemy,
        }))

const mapAllyCards = (row: BoardRow) =>
    Array(row.maxCards)
        .fill({})
        .map((_, index) => ({
            active: !!row.cards[index],
            icon:
                index === row.maxCards - 1 ? (
                    <Trophy size="large" />
                ) : undefined,
            suit: CardSuit.Ally,
        }))

const Game: React.FC<AlliesAndEnemiesState> = (props) => {
    const allyCards = mapAllyCards(props.board.ally)
    const enemyCards = mapEnemyCards(props.board.enemy, props.board.actions)

    const showTeamPopup = !props.currentTurn && !!props.team
    console.log({ a: props.currentTurn, b: props.team, showTeamPopup })
    return (
        <>
            <Main fill flex align="center" justify="center">
                <Box flex pad="medium" width="xlarge" gap="small">
                    <Section
                        align="center"
                        height={{ min: 'xsmall', max: 'large' }}
                        justify="center"
                    >
                        {props.currentTurn && (
                            <Text>
                                Waiting on{' '}
                                {props.player.id ===
                                props.currentTurn?.waitingOn.id
                                    ? 'you!'
                                    : props.currentTurn?.waitingOn.nickname}
                            </Text>
                        )}
                    </Section>
                    <Box
                        direction="row-responsive"
                        gap="medium"
                        align="start"
                        justify="center"
                    >
                        <Section
                            align="center"
                            height={{ min: 'xsmall', max: 'large' }}
                            justify="center"
                            gap="small"
                            width="large"
                        >
                            <Box
                                align="stretch"
                                direction="row"
                                fill="horizontal"
                                flex
                                justify="between"
                            >
                                <PolicyCardRow cards={allyCards} />
                            </Box>
                            <Box
                                align="stretch"
                                direction="row"
                                fill="horizontal"
                                flex
                                justify="between"
                            >
                                <PolicyCardRow cards={enemyCards} />
                            </Box>
                        </Section>
                        <Section align="center" justify="start" width="medium">
                            <TeamDetails
                                {...props.team}
                                playerNickname={props.player.nickname}
                            />
                        </Section>
                    </Box>
                </Box>
            </Main>
        </>
    )
}

export default Game
