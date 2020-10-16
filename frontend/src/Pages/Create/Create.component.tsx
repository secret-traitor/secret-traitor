import React, { useState } from 'react'
import { Box, Main, Button, Text } from 'grommet'
import { Add } from 'grommet-icons'

import { GameDescription } from 'types/GameDescription'
import { GameType } from 'types/Game'

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
                <Box
                    border={{ color: 'brand-1', size: 'small' }}
                    height={{ min: 'xsmall', max: 'large' }}
                    justify="start"
                    overflow="scroll"
                    pad="medium"
                    round="medium"
                    wrap
                    direction="column"
                >
                    <GameTypes
                        descriptions={descriptions}
                        selectedOption={selectedOption}
                        selectOption={selectOption}
                    />
                </Box>
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
