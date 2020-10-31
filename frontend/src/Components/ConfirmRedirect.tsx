import { Redirect, RedirectProps } from 'react-router'
import React, { useState } from 'react'
import { Button, Box, Text } from 'grommet'

import Popup from './Popup'
import DelayedRedirect, { DelayedRedirectProps } from './DelayedRedirect'

export type ConfirmRedirectProps = RedirectProps & DelayedRedirectProps

const ConfirmRedirect: React.FC<ConfirmRedirectProps> = (props) => {
    const { children, delay } = props
    const [ok, setOk] = useState(false)
    if (ok) return <Redirect push {...(props as RedirectProps)} />
    return (
        <Popup>
            {children}
            <Box direction="column" align="center">
                <Box direction="row-responsive" pad="small" align="center">
                    {delay && (
                        <>
                            <DelayedRedirect
                                {...(props as DelayedRedirectProps)}
                            />
                            <Text size="xsmall" weight={100} textAlign="center">
                                You are being redirected.
                            </Text>
                        </>
                    )}
                </Box>
                <Box direction="row-responsive" gap="medium" align="center">
                    <Button
                        primary
                        color="brand-2"
                        label="Click here to continue"
                        onClick={() => setOk(true)}
                    />
                </Box>
            </Box>
        </Popup>
    )
}

export default ConfirmRedirect
