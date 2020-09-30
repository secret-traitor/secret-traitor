import React from 'react'
import { Box, Text } from 'grommet'

import { GameClass, GameType } from 'types/GameType'

export const GameTypeCard: React.FC<
    GameType & { selected: boolean; select: () => void }
> = ({ description, displayName, gameClass, select, selected }) => {
    const background = selected ? 'brand-2' : 'light-1'
    const color = selected ? 'white' : 'none'
    return (
        <Box
            pad="small"
            margin="small"
            onClick={select}
            background={background}
            round="small"
        >
            <Text color={color} size="medium">
                {displayName}
            </Text>
            <Text color={color} size="small">
                {description}
            </Text>
        </Box>
    )
}

export const GameTypes: React.FC<{
    gameTypes: GameType[]
    selectedOption: GameClass
    selectOption: (gameClass: GameClass) => void
}> = ({ gameTypes, selectedOption, selectOption }) => (
    <>
        {gameTypes.map((gameType) => (
            <GameTypeCard
                key={gameType.gameClass.toString()}
                {...gameType}
                select={() => selectOption(gameType.gameClass)}
                selected={selectedOption === gameType.gameClass}
            />
        ))}
    </>
)
