import React from 'react'
import { RouteComponentProps, withRouter } from 'react-router'

import { Anchor, AnchorProps, Button, ButtonProps } from 'grommet'

type RouterLinkProps = {
    path: string
}

export type RouterAnchorProps = RouteComponentProps &
    RouterLinkProps &
    AnchorProps

const RouterAnchorBase = (props: RouterAnchorProps) => (
    <Anchor
        {...(props as AnchorProps)}
        onClick={() => props.history.push(props.path)}
    />
)

export const RouterAnchor = withRouter(RouterAnchorBase)

export type RouterButtonProps = RouteComponentProps &
    RouterLinkProps &
    ButtonProps

const RouterButtonBase = (props: RouterButtonProps) => (
    <Button
        {...(props as ButtonProps)}
        onClick={() => props.history.push(props.path)}
    />
)

export const RouterButton = withRouter(RouterButtonBase)
