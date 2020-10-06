import React, { useState } from 'react'
import { Box, Main, Button, Text } from 'grommet'
import { Add } from 'grommet-icons'

import { GameType, GameDescription } from 'types/GameDescription'
import BoxSection from 'Components/Box'

import { GameTypes } from './GameTypes'

type CreateProps = {
    descriptions: GameDescription[]
    create: (type: GameType) => void
}

const Create: React.FC<CreateProps> = ({ create, descriptions }) => {
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
                        descriptions={descriptions}
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
