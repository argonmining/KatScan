import React from 'react';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const LinkWithTooltip = ({ to, tooltip, children, ...props }) => (
  <OverlayTrigger
    placement="top"
    overlay={<Tooltip>{tooltip}</Tooltip>}
  >
    <Link to={to} {...props}>{children}</Link>
  </OverlayTrigger>
);

export default LinkWithTooltip;
