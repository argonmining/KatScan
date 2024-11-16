import React, { FC, ReactNode, useState } from 'react'
import { Button, Container, Modal, Nav, Navbar } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'
import {
    FaBars,
    FaChartLine,
    FaChevronLeft,
    FaChevronRight,
    FaCoins,
    FaExchangeAlt,
    FaFireAlt,
    FaHeart,
    FaSearch,
    FaUsers,
    FaWallet,
    FaTools,
} from 'react-icons/fa'
import logo from '../assets/logo.png'
import qrCode from '../assets/qr.png'
import 'styles/Sidebar.css'

type Props = {
    darkMode: boolean
    toggleDarkMode: () => void
    isMobile: boolean
}

const Sidebar: FC<Props> = ({ darkMode, toggleDarkMode, isMobile }) => {
    const [collapsed, setCollapsed] = useState(false)
    const [showDonateModal, setShowDonateModal] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const toggleSidebar = () => {
        setCollapsed(!collapsed)
    }

    const handleDonateClick = () => {
        setShowDonateModal(true)
    }

    const handleCloseDonateModal = () => {
        setShowDonateModal(false)
    }

    const NavSection = ({
        title,
        children,
    }: {
        title: string
        children: ReactNode
    }) => (
        <div className="nav-section">
            {!collapsed && (
                <h6 className="nav-section-title sub-header">{title}</h6>
            )}
            {children}
        </div>
    )

    return (
        <>
            {isMobile ? (
                // Mobile Navbar
                <Navbar
                    expand="lg"
                    bg={darkMode ? 'dark' : 'light'}
                    variant={darkMode ? 'dark' : 'light'}
                    expanded={expanded}
                    className="d-lg-none"
                >
                    <Container>
                        <Navbar.Brand as={Link} to="/">
                            <img
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                src={logo}
                                alt="KatScan Logo"
                                className="logo-image"
                            />
                            <span>KatScan</span>
                        </Navbar.Brand>

                        <div className="dark-mode-toggle">
                            <span className="dark-mode-label">
                                {darkMode ? 'Dark' : 'Light'}
                            </span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={darkMode}
                                    onChange={toggleDarkMode}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <Navbar.Toggle
                            aria-controls="basic-navbar-nav"
                            onClick={() => setExpanded(!expanded)}
                        >
                            <FaBars />
                        </Navbar.Toggle>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <NavLink
                                    to="/transaction-lookup"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaSearch /> Search Transactions
                                </NavLink>
                                <NavLink
                                    to="/wallet"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaWallet /> Search Addresses
                                </NavLink>
                                <NavLink
                                    to="/top-holders"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaUsers /> Top Holders
                                </NavLink>
                                <NavLink
                                    to="/tokens"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaCoins /> All Tokens
                                </NavLink>
                                <NavLink
                                    to="/compare"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaExchangeAlt /> Side by Side
                                </NavLink>
                                <NavLink
                                    to="/mint-heatmap"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaFireAlt /> Mint Heatmap
                                </NavLink>
                                <NavLink
                                    to="/marketcap-calc"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaChartLine /> MarketCap Calc
                                </NavLink>
                                <NavLink
                                    to="#"
                                    className="nav-link"
                                    onClick={handleDonateClick}
                                >
                                    <FaHeart /> Donate
                                </NavLink>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            ) : (
                // Desktop Sidebar
                <div
                    className={`sidebar ${
                        collapsed ? 'collapsed' : ''
                    } d-none d-lg-block`}
                >
                    <div className="sidebar-content">
                        <div className="sidebar-header">
                            <Link to="/" className="logo-link">
                                <img
                                    src={logo as string}
                                    alt="KatScan Logo"
                                    className="logo-image sidebar-logo"
                                />
                                {!collapsed && (
                                    <h1 className="site-title">KatScan</h1>
                                )}
                            </Link>
                        </div>
                        <Nav className="flex-column">
                            <NavSection title="KRC-20 Explorer">
                                <NavLink
                                    to="/transaction-lookup"
                                    className="nav-link"
                                >
                                    <FaSearch />{' '}
                                    {!collapsed && (
                                        <span>Search Transactions</span>
                                    )}
                                </NavLink>
                                <NavLink to="/wallet" className="nav-link">
                                    <FaWallet />{' '}
                                    {!collapsed && (
                                        <span>Search Addresses</span>
                                    )}
                                </NavLink>
                                <NavLink to="/top-holders" className="nav-link">
                                    <FaUsers />{' '}
                                    {!collapsed && <span>Top Holders</span>}
                                </NavLink>
                            </NavSection>
                            <NavSection title="KRC-20 Tokens">
                                <NavLink to="/tokens" className="nav-link">
                                    <FaCoins />{' '}
                                    {!collapsed && <span>All Tokens</span>}
                                </NavLink>
                                <NavLink to="/compare" className="nav-link">
                                    <FaExchangeAlt />{' '}
                                    {!collapsed && <span>Side by Side</span>}
                                </NavLink>
                                <NavLink
                                    to="/mint-heatmap"
                                    className="nav-link"
                                >
                                    <FaFireAlt />{' '}
                                    {!collapsed && <span>Mint Heatmap</span>}
                                </NavLink>
                                <NavLink
                                    to="/marketcap-calc"
                                    className="nav-link"
                                >
                                    <FaChartLine />{' '}
                                    {!collapsed && <span>MarketCap Calc</span>}
                                </NavLink>
                            </NavSection>
                            <NavSection title="KRC-20 Tools">
                                <NavLink
                                    to={{ pathname: "https://t.me/kspr_home_bot?start=nacho" }}
                                    className="nav-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaTools /> {!collapsed && <span>Deploy Token</span>}
                                </NavLink>
                                <NavLink
                                    to={{ pathname: "https://t.me/kspr_home_bot?start=nacho" }}
                                    className="nav-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaTools /> {!collapsed && <span>Mint Tokens</span>}
                                </NavLink>
                            </NavSection>
                            <div className="ad-container">
                                {/* Future advertising content goes here */}
                            </div>
                        </Nav>
                        <NavLink
                            to="#"
                            className="donate-link"
                            onClick={handleDonateClick}
                        >
                            <FaHeart /> {!collapsed && <span>Donate</span>}
                        </NavLink>
                        <div className="dark-mode-toggle sidebar-dark-mode-toggle">
                            <span className="dark-mode-label">
                                {darkMode ? 'Dark' : 'Light'}
                            </span>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={darkMode}
                                    onChange={toggleDarkMode}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div className="sidebar-footer">
                            {!collapsed && (
                                <p>
                                    Made with ❤️ by the
                                    <br />
                                    Nacho the 𐤊at Community
                                </p>
                            )}
                            <button
                                className="collapse-btn"
                                onClick={toggleSidebar}
                            >
                                {collapsed ? (
                                    <FaChevronRight />
                                ) : (
                                    <FaChevronLeft />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Donate Modal */}
            <Modal
                show={showDonateModal}
                onHide={handleCloseDonateModal}
                centered
                className={darkMode ? 'dark-mode' : ''}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Donate</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <p className="mt-3">
                        Send only Kaspa network assets to this address
                    </p>
                    <img
                        src={qrCode as string}
                        alt="Donate QR Code"
                        className="qr-code-image"
                    />
                    <p className="address-text">
                        kaspa:qrtsw8lkquppuurmy9zrjdgpgdthfall90ve06yw88vc9dzmr26wqvz3vlqt9
                    </p>
                    <Button
                        variant={
                            darkMode ? 'outline-light' : 'outline-secondary'
                        }
                        // eslint-disable-next-line @typescript-eslint/no-misused-promises
                        onClick={() =>
                            navigator.clipboard.writeText(
                                'kaspa:qrtsw8lkquppuurmy9zrjdgpgdthfall90ve06yw88vc9dzmr26wqvz3vlqt9',
                            )
                        }
                    >
                        Copy address
                    </Button>
                </Modal.Body>
            </Modal>
        </>
    )
}

export default Sidebar
