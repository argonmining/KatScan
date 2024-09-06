import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaExchangeAlt, FaWallet, FaCoins, FaSearch, FaChartBar, FaCalculator } from 'react-icons/fa';
import '../styles/Home.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.kasplex.org/v1';

const Home = () => {
  const [networkStats, setNetworkStats] = useState({
    opTotal: 0,
    tokenTotal: 0,
    feeTotal: 0,
  });

  const [recentTokens, setRecentTokens] = useState([]);

  useEffect(() => {
    // Fetch network stats
    fetch(`${API_BASE_URL}/info`)
      .then(response => response.json())
      .then(data => {
        const { opTotal, tokenTotal, feeTotal } = data.result;
        setNetworkStats({
          opTotal: new Intl.NumberFormat('en-US').format(opTotal),
          tokenTotal: new Intl.NumberFormat('en-US').format(tokenTotal),
          feeTotal: new Intl.NumberFormat('en-US').format((feeTotal / 1e8).toFixed(0)),
        });
      })
      .catch(error => console.error('Error fetching network stats:', error));

    // Fetch recent tokens
    fetch(`${API_BASE_URL}/krc20/tokenlist`)
      .then(response => response.json())
      .then(data => {
        const sortedTokens = data.result.sort((a, b) => b.mtsAdd - a.mtsAdd);
        setRecentTokens(sortedTokens.slice(0, 6));
      })
      .catch(error => console.error('Error fetching recent tokens:', error));
  }, []);

  const FeatureCard = ({ title, icon, link }) => (
    <Col xs={4} className="mb-2">
      <Card className="feature-card h-100" as={Link} to={link}>
        <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
          {icon}
          <Card.Title className="mt-1 text-center small">{title}</Card.Title>
        </Card.Body>
      </Card>
    </Col>
  );

  const StatCard = ({ title, value, icon }) => (
    <Col xs={4} className="mb-2">
      <Card className="stat-card h-100">
        <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
          {icon}
          <h3 className="mt-1 mb-0">{value}</h3>
          <Card.Text className="text-center small">{title}</Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <Container fluid className="home-container d-flex flex-column vh-100">
      <Row className="header-section py-2">
        <Col>
          <h1 className="text-center mb-0">KatScan</h1>
          <p className="text-center small mb-0">Explore, Analyze, and Compare KRC-20 Token Data</p>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col>
          <h5 className="section-title mb-2">Key Features</h5>
          <Row className="mb-2">
            <FeatureCard title="Transaction Lookup" icon={<FaSearch className="feature-icon" />} link="/transaction-lookup" />
            <FeatureCard title="Address Lookup" icon={<FaWallet className="feature-icon" />} link="/wallet" />
            <FeatureCard title="Token Comparison" icon={<FaExchangeAlt className="feature-icon" />} link="/compare" />
          </Row>
          <Row className="mb-3">
            <FeatureCard title="All Tokens" icon={<FaCoins className="feature-icon" />} link="/tokens" />
            <FeatureCard title="Mint Heatmap" icon={<FaChartBar className="feature-icon" />} link="/mint-heatmap" />
            <FeatureCard title="MarketCap Calculator" icon={<FaCalculator className="feature-icon" />} link="/marketcap-calc" />
          </Row>

          <h5 className="section-title mb-2">Kasplex Statistics</h5>
          <Row className="mb-4">
            <StatCard
              title="Total KRC20 Transactions"
              value={networkStats.opTotal}
              icon={<FaExchangeAlt className="stat-icon" />}
            />
            <StatCard
              title="Total KRC20 Tokens Deployed"
              value={networkStats.tokenTotal}
              icon={<FaCoins className="stat-icon" />}
            />
            <StatCard
              title="Total Fees Paid (KAS)"
              value={networkStats.feeTotal}
              icon={<FaWallet className="stat-icon" />}
            />
          </Row>

          <h5 className="section-title mb-2">Recent Tokens</h5>
          <Row>
            {recentTokens.map(token => (
              <Col xs={4} key={token.hashRev} className="mb-2">
                <Card className="token-card h-100" as={Link} to={`/tokens/${token.tick}`}>
                  <Card.Body className="p-2">
                    <Card.Title className="small mb-1">{token.tick}</Card.Title>
                    <Card.Text className="small mb-0">Max: {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(token.max / Math.pow(10, token.dec))}</Card.Text>
                    <Card.Text className="small mb-0">Minted: {new Intl.NumberFormat('en-US', { notation: 'compact' }).format(token.minted / Math.pow(10, token.dec))}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;