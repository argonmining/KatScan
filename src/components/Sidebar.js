import React, { useState } from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import { FaSearch, FaWallet, FaCoins, FaExchangeAlt, FaFireAlt, FaChartLine, FaUsers, FaChartPie, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import logo from '../assets/logo.png';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const NavSection = ({ title, children }) => (
    <div className="nav-section">
      {!collapsed && <h6 className="nav-section-title sub-header">{title}</h6>}
      {children}
    </div>
  );

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-content">
        <div className="sidebar-header">
          <Link to="/" className="logo-link">
            <img src={logo} alt="KatScan Logo" className="logo-image" />
            {!collapsed && <h1 className="site-title">KatScan</h1>}
          </Link>
        </div>
        <Nav className="flex-column">
          <NavSection title="KRC-20 Explorer">
            <NavLink to="/transaction-lookup" className="nav-link" activeClassName="active">
              <FaSearch /> {!collapsed && <span>Search Transactions</span>}
            </NavLink>
            <NavLink to="/wallet" className="nav-link" activeClassName="active">
              <FaWallet /> {!collapsed && <span>Search Addresses</span>}
            </NavLink>
          </NavSection>

          <NavSection title="KRC-20 Tokens">
            <NavLink to="/tokens" className="nav-link" activeClassName="active">
              <FaCoins /> {!collapsed && <span>All Tokens</span>}
            </NavLink>
            <NavLink to="/compare" className="nav-link" activeClassName="active">
              <FaExchangeAlt /> {!collapsed && <span>Side by Side</span>}
            </NavLink>
            <NavLink to="/mint-heatmap" className="nav-link" activeClassName="active">
              <FaFireAlt /> {!collapsed && <span>Mint Heatmap</span>}
            </NavLink>
            <NavLink to="/marketcap-calc" className="nav-link" activeClassName="active">
              <FaChartLine /> {!collapsed && <span>MarketCap Calc</span>}
            </NavLink>
          </NavSection>

          <NavSection title="Info by Holder">
            <NavLink to="/top-holders" className="nav-link" activeClassName="active">
              <FaUsers /> {!collapsed && <span>Top KRC-20 Holders</span>}
            </NavLink>
            <NavLink to="/holder-distribution" className="nav-link" activeClassName="active">
              <FaChartPie /> {!collapsed && <span>Holder Distribution</span>}
            </NavLink>
          </NavSection>
        </Nav>
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
  );
};

export default Sidebar;