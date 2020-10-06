import React from 'react'
import { Box, Text } from 'grommet'
import { RouterButton } from '../../Components/RouterButton'
import { getCreateUrl } from '../../links'
import { AddCircle } from 'grommet-icons'

export const EmptyGames: React.FC = () => (
    <Box fill justify="center" align="center">
        <RouterButton size="large" path={getCreateUrl()}>
            <Box flex align="center" justify="center">
                <Box align="center">
                    <Text color="light-4">There are no games currently.</Text>
                </Box>
                <AddCircle color="light-4" size="xlarge" />
                <Box align="center">
                    <Text color="light-4">
                        Click here To create a new game.
                    </Text>
                </Box>
            </Box>
        </RouterButton>
    </Box>
)
