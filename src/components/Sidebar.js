import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Nav defaultActiveKey="/home" className="flex-column">
        <NavLink to="/" exact className="nav-link" activeClassName="active">Home</NavLink>
        <NavLink to="/tokens" className="nav-link" activeClassName="active">Tokens</NavLink>
        <NavLink to="/analytics" className="nav-link" activeClassName="active">Analytics</NavLink>
        <NavLink to="/compare" className="nav-link" activeClassName="active">Compare</NavLink> {/* New Compare Option */}
        <NavLink to="/about" className="nav-link" activeClassName="active">About</NavLink>
      </Nav>
    </div>
  );
};

export default Sidebar;
