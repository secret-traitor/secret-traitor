import React, { useState } from 'react'
import { Box, Button, Text } from 'grommet'

import Popup from 'Components/Popup'

import { Card } from 'Games/AlliesAndEnemies/types'
import { PolicyCard } from 'Games/AlliesAndEnemies/Components/Cards/PolicyCard'
import { CardBorder } from 'Games/AlliesAndEnemies/Components/Cards/CardBorder'
import { DiscardIndex } from './hooks'

type Discard = (position: DiscardIndex) => void
type FirstHandProps = {
    cards: [Card, Card, Card]
    discard: Discard
}

const FirstHand: React.FC<FirstHandProps> = ({ cards, discard }) => {
    const [selected, setSelected] = useState<DiscardIndex>()
    return (
        <Popup>
            <Box dir="row" gap="medium" align="center">
                <Text textAlign="center" size="large" weight="bold">
                    It is your turn...
                </Text>
                <Text textAlign="center">
                    You need to select one of the cards below to discard.
                </Text>
                <Text textAlign="center">
                    The other two will be sent to the elected Governor.
                </Text>
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
                    <Box onClick={() => setSelected(2)}>
                        <CardBorder
                            border={selected === 2 ? 'highlighted' : 'none'}
                            selectable={true}
                        >
                            <PolicyCard suit={cards[2].suit} />
                        </CardBorder>
                    </Box>
                </Box>
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
                <Text textAlign="center" size="large" weight="bold">
                    Shh! No discussion please.
                </Text>
            </Box>
        </Popup>
    )
}

export default FirstHand
