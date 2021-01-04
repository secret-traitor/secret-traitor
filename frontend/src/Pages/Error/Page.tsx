import React from 'react'
import { Box, Text } from 'grommet'

import Bricks from 'Assets/bricks.jpg'
import Main from 'Components/Main'
import Popup from 'Components/Popup'

const ErrorTypes = ['network']
export type ErrorType = typeof ErrorTypes[number]

const TextRecord: Record<ErrorType, { head: any; body: any }> = {
    network: {
        head: 'Network Error',
        body: 'The server is not reachable. Please try again later.',
    },
}

const ErrorPage: React.FC<{ type?: string }> = ({ type }) => {
    const errorType =
        type && ErrorTypes.includes(type) ? (type as ErrorType) : undefined
    return (
        <Main background={`url(${Bricks})`}>
            <Popup
                plain
                background={{ color: 'dark-2', opacity: 0.95 }}
                border={{ style: 'dashed', color: 'dark-3', size: 'medium' }}
            >
                <Box color="white" gap="medium">
                    <Text size="xxlarge" weight={700} textAlign="center">
                        {errorType ? TextRecord[errorType].head : 'Uh Oh!'}
                    </Text>
                    <Text size="medium" weight={100}>
                        {errorType
                            ? TextRecord[errorType].body
                            : 'Something went wrong.'}
                    </Text>
                </Box>
            </Popup>
        </Main>
    )
}

export default ErrorPage
