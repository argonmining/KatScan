import React, { forwardRef, ReactNode, useState } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { Link, NavLink } from 'react-router-dom'
import {
    FaBars,
    FaChartLine,
    FaCoins,
    FaColumns,
    FaExchangeAlt,
    FaFireAlt,
    FaRobot,
    FaSearch,
    FaUsers,
    FaWallet,
} from 'react-icons/fa'
import logo from '../assets/logo.png'
import yourAdHere from '../assets/kpawAd.png'
import 'styles/Sidebar.css'
import { DonationModal } from "./DonationModal";

type Props = {
    darkMode: boolean
    toggleDarkMode: () => void
    isMobile: boolean
}

const Sidebar = forwardRef<HTMLDivElement, Props>(({ darkMode, toggleDarkMode, isMobile }, ref) => {
    /*const [collapsed, setCollapsed] = useState(false)*/
    const [collapsed] = useState(false)
    const [showDonateModal, setShowDonateModal] = useState(false)
    const [expanded, setExpanded] = useState(false)

    /*const toggleSidebar = () => {
        setCollapsed(!collapsed)
    }*/

    const handleDonateClick = () => {
        setShowDonateModal(true)
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
                    ref={ref}
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
                                    <FaColumns /> Side by Side
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
                                {/*
                                <NavLink
                                    to="#"
                                    className="nav-link"
                                    onClick={handleDonateClick}
                                >
                                    <FaHeart /> Donate
                                </NavLink>
                                */}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            ) : (
                // Desktop Sidebar
                <div id={'navbar'}
                    ref={ref}
                    className={`sidebar ${collapsed ? 'collapsed' : ''
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
                                    to="https://t.me/kspr_home_bot?start=nacho"
                                    className="nav-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaExchangeAlt /> {!collapsed && <span>Trade on KSPR</span>}
                                </NavLink>
                                <NavLink
                                    to="https://t.me/kspr_home_bot?start=nacho"
                                    className="nav-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaRobot /> {!collapsed && <span>Mint & Deploy</span>}
                                </NavLink>
                            </NavSection>
                            <div className="ad-container">
                                <a href="https://www.kaspaw.io/" target="_blank" rel="noopener noreferrer">
                                    <img src={yourAdHere as string}
                                        alt="KPAW Advert"
                                        className="ad-image" />
                                </a>
                            </div>
                        </Nav>
                        {/*
                        <NavLink
                            to="#"
                            className="donate-link"
                            onClick={handleDonateClick}
                        >
                            <FaHeart /> {!collapsed && <span>Donate</span>}
                        </NavLink>
                        */}
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
                                <p onClick={handleDonateClick} style={{ cursor: 'pointer' }}>
                                    Made with ❤️ by the
                                    <br />
                                    Nacho the 𐤊at Community
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Donate Modal */}
            <DonationModal show={showDonateModal} close={() => setShowDonateModal(false)} />
        </>
    )
})

Sidebar.displayName = 'Sidebar'
export default Sidebar
