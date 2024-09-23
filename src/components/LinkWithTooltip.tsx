import React, {FC, ReactNode} from 'react';
import {Link} from 'react-router-dom';
import {OverlayTrigger, Tooltip} from 'react-bootstrap';

type Props = Record<string, unknown> & {
    to: string
    tooltip: string
    children: ReactNode
}
export const LinkWithTooltip: FC<Props> = ({to, tooltip, children, ...props}) => (
    <OverlayTrigger
        placement="top"
        overlay={<Tooltip>{tooltip}</Tooltip>}
    >
        <Link to={to} {...props}>{children}</Link>
    </OverlayTrigger>
);
