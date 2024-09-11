// src/components/Sidebar.js
import React, { useState } from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import { FaSearch, FaWallet, FaCoins, FaBars, FaChevronLeft, FaChevronRight, FaHeart } from 'react-icons/fa';
import logo from '../assets/logo.png';
import qrCode from '../assets/qr.png';
import '../styles/Sidebar.css';
import { Modal, Button } from 'react-bootstrap'; 

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [expanded, setExpanded] = useState(false); // Added for mobile

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleDonateClick = () => {
    setShowDonateModal(true);
  };

  const handleCloseDonateModal = () => {
    setShowDonateModal(false);
  };

  return (
    <>
      {/* Mobile Navbar */}
      <Navbar expand="lg" bg="light" variant="light" expanded={expanded} className="d-lg-none"> {/* Visible on mobile */}
        <Container>
          <Navbar.Brand as={Link} to="/">
            <img src={logo} alt="KatScan Logo" className="logo-image" />
            <span className="ms-2">KatScan</span>
          </Navbar.Brand>
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
            onClick={() => setExpanded(!expanded)} // Toggle expanded state
          >
            <FaBars />
          </Navbar.Toggle>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={NavLink} to="/transaction-lookup" onClick={() => setExpanded(false)}>
                <FaSearch /> Search Transactions
              </Nav.Link>
              <Nav.Link as={NavLink} to="/wallet" onClick={() => setExpanded(false)}>
                <FaWallet /> Search Addresses
              </Nav.Link>
              <Nav.Link as={NavLink} to="/tokens" onClick={() => setExpanded(false)}>
                <FaCoins /> All Tokens
              </Nav.Link>
              <Nav.Link as={NavLink} to="#" onClick={handleDonateClick}>
                <FaHeart /> Donate
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Desktop Sidebar */}
      <div className={`sidebar ${collapsed ? 'collapsed' : ''} d-none d-lg-block`}> {/* Visible on desktop */}
        <div className="sidebar-content">
          <div className="sidebar-header">
            <Link to="/" className="logo-link">
              <img src={logo} alt="KatScan Logo" className="logo-image" />
              {!collapsed && <h1 className="site-title">KatScan</h1>}
            </Link>
          </div>
          <Nav className="flex-column">
            <NavLink to="/transaction-lookup" className="nav-link">
              <FaSearch /> {!collapsed && <span>Search Transactions</span>}
            </NavLink>
            <NavLink to="/wallet" className="nav-link">
              <FaWallet /> {!collapsed && <span>Search Addresses</span>}
            </NavLink>
            <NavLink to="/tokens" className="nav-link">
              <FaCoins /> {!collapsed && <span>All Tokens</span>}
            </NavLink>
          </Nav>
          <NavLink to="#" className="donate-link" onClick={handleDonateClick}>
            <FaHeart /> {!collapsed && <span>Donate</span>}
          </NavLink>
          <div className="sidebar-footer">
            {!collapsed && (
              <p>
                Made with ❤️ by the<br />
                Nacho the Kat Community
              </p>
            )}
            <button className="collapse-btn" onClick={toggleSidebar}>
              {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>
        </div>
      </div>

      {/* Donate Modal */}
      <Modal show={showDonateModal} onHide={handleCloseDonateModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Donate</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p className="mt-3">Send only Kaspa network assets to this address</p>
          <img src={qrCode} alt="Donate QR Code" className="qr-code-image" />
          <p className="address-text">kaspa:qrtsw8lkquppuurmy9zrjdgpgdthfall90ve06yw88vc9dzmr26wqvz3vlqt9</p>
          <Button variant="outline-secondary" onClick={() => navigator.clipboard.writeText('kaspa:qrtsw8lkquppuurmy9zrjdgpgdthfall90ve06yw88vc9dzmr26wqvz3vlqt9')}>
            Copy address
          </Button>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Sidebar;
