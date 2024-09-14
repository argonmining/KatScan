import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb } from 'react-bootstrap';

const Breadcrumbs = ({ items }) => (
  <Breadcrumb>
    {items.map((item, index) => (
      <Breadcrumb.Item
        key={index}
        linkAs={Link}
        linkProps={{ to: item.path }}
        active={index === items.length - 1}
      >
        {item.label}
      </Breadcrumb.Item>
    ))}
  </Breadcrumb>
);

export default Breadcrumbs;
