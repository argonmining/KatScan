import React, {forwardRef, useState} from 'react'
import {Container, Nav, Navbar} from 'react-bootstrap'
import {Link, NavLink} from 'react-router-dom'
import {
    FaBars,
    FaChartLine,
    FaCoins,
    FaColumns,
    FaExchangeAlt,
    FaFireAlt,
    FaRobot,
    FaSearch,
    FaPaintBrush,
    FaUsers,
    FaWallet,
    FaBullhorn
} from 'react-icons/fa'
import logo from '../assets/logo.png'
import yourAdHere from '../assets/nachoNFT.png'
import 'styles/Sidebar.css'
import {DonationModal} from "./donationModal/DonationModal";
import {ControlledExpandableDiv, useDarkMode, useMobile} from "nacho-component-library";
import {FaFileLines} from "react-icons/fa6";

const Sidebar = forwardRef<HTMLDivElement>((_, ref) => {
    const [collapsed] = useState(false)
    const [showDonateModal, setShowDonateModal] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const {isDarkMode} = useDarkMode()
    const {isMobile} = useMobile()
    const [openCategory, setOpenCategory] = useState<string | undefined>('KRC-721-Explorer')

    const handleDonateClick = () => {
        setShowDonateModal(true)
    }

    return (
        <>
            {isMobile &&
                // Mobile Navbar
                <Navbar
                    ref={ref}
                    expand="lg"
                    bg={isDarkMode ? 'dark' : 'light'}
                    variant={isDarkMode ? 'dark' : 'light'}
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
                        <Navbar.Toggle
                            aria-controls="basic-navbar-nav"
                            onClick={() => setExpanded(!expanded)}
                        >
                            <FaBars/>
                        </Navbar.Toggle>
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                            <NavLink
                                    to="https://nft.katscan.xyz"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaPaintBrush/> NFT Collections
                                </NavLink>
                                <NavLink
                                    to="/transaction-lookup"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaSearch/> Transactions
                                </NavLink>
                                <NavLink
                                    to="/wallet"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaWallet/> Addresses
                                </NavLink>
                                <NavLink
                                    to="/top-holders"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaUsers/> Top Holders
                                </NavLink>
                                <NavLink
                                    to="/tokens"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaCoins/> All Tokens
                                </NavLink>
                                <NavLink
                                    to="/compare"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaColumns/> Side by Side
                                </NavLink>
                                <NavLink
                                    to="/mint-heatmap"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaFireAlt/> Mint Heatmap
                                </NavLink>
                                <NavLink
                                    to="/marketcap-calc"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaChartLine/> MarketCap Calc
                                </NavLink>
                                <NavLink
                                    to="/announcements"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaBullhorn/> Announcements
                                </NavLink>
                                <NavLink
                                    to="/whitelist"
                                    className="nav-link"
                                    onClick={() => setExpanded(false)}
                                >
                                    <FaBullhorn/> Nacho Kats WL
                                </NavLink>

                                <span onClick={handleDonateClick} className={'donation-text'}>
                                    Made with ❤️ by the
                                    <br/>
                                    Nacho the 𐤊at Community
                                </span>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>}

            {!isMobile && (
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
                        <ControlledExpandableDiv id={'KRC-721-Explorer'}
                                                     title={'Explore KRC-721'}
                                                     changeExtended={(id) => setOpenCategory(id)}
                                                     isExtended={openCategory === 'KRC-721-Explorer'}>
                                <NavLink
                                    to="https://nft.katscan.xyz"
                                    className="nav-link"
                                >
                                    <FaPaintBrush/>{' '}
                                    {!collapsed && (
                                        <span>NFT Collections</span>
                                    )}
                                </NavLink>
                            </ControlledExpandableDiv>
                            <ControlledExpandableDiv id={'KRC-20-Explorer'}
                                                     title={'Explore KRC-20'}
                                                     changeExtended={(id) => setOpenCategory(id)}
                                                     isExtended={openCategory === 'KRC-20-Explorer'}>
                                <NavLink
                                    to="/transaction-lookup"
                                    className="nav-link"
                                >
                                    <FaSearch/>{' '}
                                    {!collapsed && (
                                        <span>Search Transactions</span>
                                    )}
                                </NavLink>
                                <NavLink to="/wallet" className="nav-link">
                                    <FaWallet/>{' '}
                                    {!collapsed && (
                                        <span>Search Addresses</span>
                                    )}
                                </NavLink>
                                <NavLink to="/top-holders" className="nav-link">
                                    <FaUsers/>{' '}
                                    {!collapsed && <span>Top Holders</span>}
                                </NavLink>
                            </ControlledExpandableDiv>
                            <ControlledExpandableDiv id={'KRC-20-Tokens'}
                                                     title={'Analyze KRC-20'}
                                                     changeExtended={(id) => setOpenCategory(id)}
                                                     isExtended={openCategory === 'KRC-20-Tokens'}>
                                <NavLink to="/tokens" className="nav-link">
                                    <FaCoins/>{' '}
                                    {!collapsed && <span>All Tokens</span>}
                                </NavLink>
                                <NavLink to="/compare" className="nav-link">
                                    <FaExchangeAlt/>{' '}
                                    {!collapsed && <span>Side by Side</span>}
                                </NavLink>
                                <NavLink
                                    to="/mint-heatmap"
                                    className="nav-link"
                                >
                                    <FaFireAlt/>{' '}
                                    {!collapsed && <span>Mint Heatmap</span>}
                                </NavLink>
                                <NavLink
                                    to="/marketcap-calc"
                                    className="nav-link"
                                >
                                    <FaChartLine/>{' '}
                                    {!collapsed && <span>MarketCap Calc</span>}
                                </NavLink>
                                {/*</NavSection>*/}
                            </ControlledExpandableDiv>
                            <ControlledExpandableDiv id={'KRC-20-Tools'}
                                                     title={'Tools'}
                                                     changeExtended={(id) => setOpenCategory(id)}
                                                     isExtended={openCategory === 'KRC-20-Tools'}>
                                <NavLink
                                    to="https://t.me/kspr_home_bot?start=nacho"
                                    className="nav-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaExchangeAlt/> {!collapsed && <span>Trade on KSPR</span>}
                                </NavLink>
                                <NavLink
                                    to="https://t.me/kspr_home_bot?start=nacho"
                                    className="nav-link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FaRobot/> {!collapsed && <span>Mint & Deploy</span>}
                                </NavLink>
                                <NavLink
                                    to="/announcements"
                                    className="nav-link"
                                >
                                    <FaBullhorn/> {!collapsed && <span>Announcements</span>}
                                </NavLink>
                                <NavLink
                                    to="/whitelist"
                                    className="nav-link"
                                >
                                    <FaFileLines/> {!collapsed && <span>Nacho Kats WL</span>}
                                </NavLink>
                            </ControlledExpandableDiv>
                            <div className="ad-container">
                                <a href="https://t.me/kspr_home_bot?start=nacho" target="_blank" rel="noopener noreferrer">
                                    <img src={yourAdHere as string}
                                         alt="Nachk Kats NFTs Advert"
                                         className="ad-image"/>
                                </a>
                            </div>
                        </Nav>
                        <div className="sidebar-footer">
                            {!collapsed && (
                                <p onClick={handleDonateClick} style={{cursor: 'pointer'}}>
                                    Made with ❤️ by the
                                    <br/>
                                    Nacho the 𐤊at Community
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Donate Modal */}
            {showDonateModal && <DonationModal show={showDonateModal} close={() => setShowDonateModal(false)}/>}
        </>
    )
})

Sidebar.displayName = 'Sidebar'
export default Sidebar
