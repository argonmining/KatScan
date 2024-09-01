import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import '../styles/TopBar.css';

const TopBar = () => {
  return (
    <Navbar bg="light" expand="lg" className="topbar">
      <Navbar.Brand href="#home">KatScan</Navbar.Brand>
      <Nav className="ml-auto">
        <Nav.Link href="#contact">Contact</Nav.Link>
        <Nav.Link href="#settings">Settings</Nav.Link>
      </Nav>
    </Navbar>
  );
};

export default TopBar;
