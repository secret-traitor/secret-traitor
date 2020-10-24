import React, { useState } from 'react'
import { Box, Button, Text } from 'grommet'

import { PlayerState } from 'Games/AlliesAndEnemies/types'

import Popup from 'Components/Popup'
import { PlayerCard } from 'Games/AlliesAndEnemies/Components/Cards'

export type Vote = (vote: 'yes' | 'no') => void
export type ElectionProps = {
    governorNominee: PlayerState
    presidentNominee: PlayerState
    viewingPlayer: PlayerState
    vote: Vote
}

const Election: React.FC<ElectionProps> = ({
    viewingPlayer,
    governorNominee,
    presidentNominee,
    vote,
}) => {
    const [selected, setSelected] = useState<'yes' | 'no'>()
    return (
        <Popup>
            <Box dir="row" gap="medium" align="center">
                <Text textAlign="center" size="large" weight="bold">
                    It is your turn...
                </Text>
                <Text textAlign="center">
                    You need to vote to decide if these candidates will be
                    elected.
                </Text>
                <Box
                    direction="row"
                    gap="medium"
                    justify="center"
                    align="center"
                >
                    <PlayerCard
                        {...presidentNominee}
                        isForViewingPlayer={
                            viewingPlayer.id === presidentNominee.id
                        }
                        currentOffice="president"
                    />
                    <Text size="xlarge">&</Text>
                    <PlayerCard
                        {...governorNominee}
                        isForViewingPlayer={
                            viewingPlayer.id === governorNominee.id
                        }
                        currentOffice="governor"
                    />
                </Box>
                <Box direction="row" gap="medium">
                    <Box
                        round="xlarge"
                        onClick={() => setSelected('no')}
                        border={{
                            color:
                                selected === 'no' ? 'orange' : 'rgba(0,0,0,0)',
                            size: 'medium',
                            style: 'dashed',
                        }}
                        pad="xxsmall"
                    >
                        <Button
                            primary
                            color="brand-2"
                            size="large"
                            label="Nay!"
                            onClick={() => vote('no')}
                        />
                    </Box>
                    <Box
                        round="xlarge"
                        onClick={() => setSelected('yes')}
                        border={{
                            color:
                                selected === 'yes' ? 'orange' : 'rgba(0,0,0,0)',
                            size: 'medium',
                            style: 'dashed',
                        }}
                        pad="xxsmall"
                    >
                        <Button
                            primary
                            color="brand-3"
                            size="large"
                            label="Yay!"
                            onClick={() => vote('yes')}
                        />
                    </Box>
                </Box>
                <Text textAlign="center" size="large" weight="bold">
                    You may discuss your choice.
                </Text>
            </Box>
        </Popup>
    )
}

export default Election
