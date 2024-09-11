import React, { useState } from 'react';
import { Nav, Navbar, Container } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import {
  FaSearch, FaWallet, FaCoins, FaExchangeAlt, FaFireAlt, FaChartLine, FaUsers, 
  FaChevronLeft, FaChevronRight, FaHeart, FaBars
} from 'react-icons/fa';
import logo from '../assets/logo.png';
import qrCode from '../assets/qr.png'; // Add this import
import '../styles/Sidebar.css';
import { Modal, Button } from 'react-bootstrap'; // Add this import

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [showDonateModal, setShowDonateModal] = useState(false); // Add this state
  const [expanded, setExpanded] = useState(false); // State for mobile hamburger menu

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleDonateClick = () => {
    setShowDonateModal(true);
  };

  const handleCloseDonateModal = () => {
    setShowDonateModal(false);
  };

  const NavSection = ({ title, children }) => (
    <div className="nav-section">
      {!collapsed && <h6 className="nav-section-title sub-header">{title}</h6>}
      {children}
    </div>
  );

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
              {/* KRC-20 Explorer Section */}
              <NavLink to="/transaction-lookup" className="nav-link" onClick={() => setExpanded(false)}>
                <FaSearch /> Search Transactions
              </NavLink>
              <NavLink to="/wallet" className="nav-link" onClick={() => setExpanded(false)}>
                <FaWallet /> Search Addresses
              </NavLink>
              <NavLink to="/top-holders" className="nav-link" onClick={() => setExpanded(false)}>
                <FaUsers /> Top Holders
              </NavLink>
              {/* KRC-20 Tokens Section */}
              <NavLink to="/tokens" className="nav-link" onClick={() => setExpanded(false)}>
                <FaCoins /> All Tokens
              </NavLink>
              <NavLink to="/compare" className="nav-link" onClick={() => setExpanded(false)}>
                <FaExchangeAlt /> Side by Side
              </NavLink>
              <NavLink to="/mint-heatmap" className="nav-link" onClick={() => setExpanded(false)}>
                <FaFireAlt /> Mint Heatmap
              </NavLink>
              <NavLink to="/marketcap-calc" className="nav-link" onClick={() => setExpanded(false)}>
                <FaChartLine /> MarketCap Calc
              </NavLink>
              <NavLink to="#" className="nav-link" onClick={handleDonateClick}>
                <FaHeart /> Donate
              </NavLink>
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
            {/* KRC-20 Explorer Section */}
            <NavSection title="KRC-20 Explorer">
              <NavLink to="/transaction-lookup" className="nav-link">
                <FaSearch /> {!collapsed && <span>Search Transactions</span>}
              </NavLink>
              <NavLink to="/wallet" className="nav-link">
                <FaWallet /> {!collapsed && <span>Search Addresses</span>}
              </NavLink>
              <NavLink to="/top-holders" className="nav-link">
                <FaUsers /> {!collapsed && <span>Top Holders</span>}
              </NavLink>
            </NavSection>
            {/* KRC-20 Tokens Section */}
            <NavSection title="KRC-20 Tokens">
              <NavLink to="/tokens" className="nav-link">
                <FaCoins /> {!collapsed && <span>All Tokens</span>}
              </NavLink>
              <NavLink to="/compare" className="nav-link">
                <FaExchangeAlt /> {!collapsed && <span>Side by Side</span>}
              </NavLink>
              <NavLink to="/mint-heatmap" className="nav-link">
                <FaFireAlt /> {!collapsed && <span>Mint Heatmap</span>}
              </NavLink>
              <NavLink to="/marketcap-calc" className="nav-link">
                <FaChartLine /> {!collapsed && <span>MarketCap Calc</span>}
              </NavLink>
            </NavSection>
          </Nav>
          <NavLink to="#" className="donate-link" onClick={handleDonateClick}>
            <FaHeart /> {!collapsed && <span>Donate</span>}
          </NavLink>
          <div className="sidebar-footer">
            {!collapsed && (
              <p>
                Made with ❤️ by the<br />
                Nacho the 𐤊at Community
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
