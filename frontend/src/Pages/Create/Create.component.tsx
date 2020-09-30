import React, { useState } from 'react'
import { Box, Main, Button, Text } from 'grommet'
import { Add } from 'grommet-icons'

import { GameClass, GameType } from 'types/GameType'
import BoxSection from 'Components/Box'

import { GameTypes } from './GameTypes'

type CreateProps = {
    gameTypes: GameType[]
    create: (gameClass: GameClass) => void
}

const Create: React.FC<CreateProps> = ({ create, gameTypes }) => {
    const [selectedOption, selectOption] = useState()
    return (
        <Main fill flex align="center" justify="center">
            <Box flex pad="medium" width="large">
                <Box direction="row-responsive" justify="between">
                    <Box width="xsmall" align="center">
                        <Button
                            onClick={() =>
                                selectedOption ? create(selectedOption) : {}
                            }
                            icon={<Add />}
                            disabled={!selectedOption}
                        />
                    </Box>
                </Box>
                <BoxSection
                    direction="column"
                    height={{ min: 'xsmall', max: 'large' }}
                >
                    <GameTypes
                        gameTypes={gameTypes}
                        selectedOption={selectedOption}
                        selectOption={selectOption}
                    />
                </BoxSection>
                <Box align="center" pad="large">
                    <Text color="dark-4">
                        More games and game re-skins coming soon...
                    </Text>
                </Box>
            </Box>
        </Main>
    )
}

export default Create
