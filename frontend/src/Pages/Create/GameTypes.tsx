import React from 'react'
import { Box, Text } from 'grommet'

import { GameDescription } from 'types/GameDescription'
import { GameType } from 'types/Game'

export const GameTypeCard: React.FC<
    GameDescription & { selected: boolean; select: () => void }
> = ({ description, displayName, select, selected }) => {
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
    descriptions: GameDescription[]
    selectedOption: GameType
    selectOption: (type: GameType) => void
}> = ({ descriptions, selectedOption, selectOption }) => (
    <>
        {descriptions.map((description) => (
            <GameTypeCard
                key={description.type.toString()}
                {...description}
                select={() => selectOption(description.type)}
                selected={selectedOption === description.type}
            />
        ))}
    </>
)
