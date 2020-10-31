import React from 'react'
import { Box, Button, Text } from 'grommet'

import Popup from 'Components/Popup'

import { Card } from 'Games/AlliesAndEnemies/types'
import { PolicyCardRow } from 'Games/AlliesAndEnemies/Components/Cards'

export type PolicyPeekProps = {
    cards: [Card, Card, Card]
    ok: () => void
}

const PolicyPeak: React.FC<PolicyPeekProps> = ({ cards, ok }) => {
    return (
        <Popup>
            <Box dir="row" gap="medium" align="center" width="medium">
                <Text textAlign="center" size="large" weight="bold">
                    It is your turn...
                </Text>
                <Text textAlign="center" weight="bold" color="brand-3">
                    Policy Peek
                </Text>
                <Text textAlign="center">
                    Below are the next three policy cards.
                </Text>
                <Box
                    direction="row"
                    fill="horizontal"
                    flex
                    justify="between"
                    gap="medium"
                >
                    <PolicyCardRow cards={cards} />
                </Box>
                <Button
                    primary
                    color="brand-3"
                    label="Click here to continue"
                    onClick={() => ok()}
                />
                <Text textAlign="center" size="large" weight="bold">
                    You may discuss these results.
                </Text>
            </Box>
        </Popup>
    )
}
export default PolicyPeak
