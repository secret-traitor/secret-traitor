import React from 'react'
import { Accessibility, Close, Notes, Trophy, View } from 'grommet-icons'
import { Box } from 'grommet'

import {
    AlliesAndEnemiesState,
    BoardAction,
    BoardRow,
    CardSuit,
} from 'Games/AlliesAndEnemies/types'
import Section from 'Components/Box'

import { PolicyCardRow } from './Cards'

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

export const PolicyBoard: React.FC<AlliesAndEnemiesState> = ({ board }) => {
    return (
        <Section
            align="center"
            gap="small"
            justify="center"
            margin="small"
            width="xlarge"
        >
            <Box direction="row" fill="horizontal" flex justify="between">
                <PolicyCardRow cards={mapAllyCards(board.ally)} />
            </Box>
            <Box direction="row" fill="horizontal" flex justify="between">
                <PolicyCardRow
                    cards={mapEnemyCards(board.enemy, board.actions)}
                />
            </Box>
        </Section>
    )
}
