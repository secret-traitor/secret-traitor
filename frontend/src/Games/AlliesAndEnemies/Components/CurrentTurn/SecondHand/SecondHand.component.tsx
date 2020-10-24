import React, { useState } from 'react'
import { Box, Button, Text } from 'grommet'

import Popup from 'Components/Popup'

import { Card } from 'Games/AlliesAndEnemies/types'
import { PolicyCard } from 'Games/AlliesAndEnemies/Components/Cards/PolicyCard'
import { CardBorder } from '../../Cards/CardBorder'

type Discard = (position: number) => void
type SecondHandProps = {
    cards: [Card, Card]
    discard: Discard
}

const SecondHand: React.FC<SecondHandProps> = ({ cards, discard }) => {
    const [selected, setSelected] = useState<number>()
    return (
        <Popup>
            <Box dir="row" gap="medium" align="center">
                <Text textAlign="center" size="large" weight="bold">
                    It is your turn...
                </Text>
                <Text textAlign="center">
                    You need to select one of the cards below to discard.
                </Text>
                <Text textAlign="center">The last card will be played.</Text>
                <Box direction="row" gap="large">
                    <Box onClick={() => setSelected(0)}>
                        <CardBorder
                            border={selected === 0 ? 'highlighted' : 'none'}
                            selectable={true}
                        >
                            <PolicyCard suit={cards[0].suit} />
                        </CardBorder>
                    </Box>
                    <Box onClick={() => setSelected(1)}>
                        <CardBorder
                            border={selected === 1 ? 'highlighted' : 'none'}
                            selectable={true}
                        >
                            <PolicyCard suit={cards[1].suit} />
                        </CardBorder>
                    </Box>
                </Box>
                <Text textAlign="center" size="large" weight="bold">
                    Shh! No discussion please.
                </Text>
                <Button
                    onClick={() => {
                        if (selected !== undefined) discard(selected)
                    }}
                    disabled={selected === undefined}
                    primary
                    label="Discard"
                    color="brand-3"
                    size="large"
                />
            </Box>
        </Popup>
    )
}

export default SecondHand
