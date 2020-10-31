import React, { useState } from 'react'
import { Box, Button, Text } from 'grommet'

import Popup from 'Components/Popup'

import { Card } from 'Games/AlliesAndEnemies/types'
import { PolicyCard, CardBorder } from 'Games/AlliesAndEnemies/Components/Cards'

import { DiscardIndex } from './hooks'

type Discard = (position: DiscardIndex) => void
type SecondHandProps = {
    cards: [Card, Card]
    discard: Discard
    callVeto: () => void
    enableVeto: boolean
}

const SecondHand: React.FC<SecondHandProps> = ({
    cards,
    discard,
    callVeto,
    enableVeto,
}) => {
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
                <Box direction="row" gap="large">
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
                    <Button
                        onClick={() => callVeto()}
                        disabled={!enableVeto}
                        primary
                        label="Call Veto"
                        color="brand-4"
                        size="large"
                    />
                </Box>
                <Text textAlign="center" size="large" weight="bold">
                    Shh! No discussion please.
                </Text>
            </Box>
        </Popup>
    )
}

export default SecondHand
