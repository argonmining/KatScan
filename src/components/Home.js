import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaExchangeAlt, FaWallet, FaCoins } from 'react-icons/fa';
import '../styles/Home.css';

const Home = () => {
  const [networkStats, setNetworkStats] = useState({
    opTotal: 0,
    tokenTotal: 0,
    feeTotal: 0,
  });

  const [recentTokens, setRecentTokens] = useState([]);

  useEffect(() => {
    fetch('https://api.kasplex.org/v1/info')
      .then(response => response.json())
      .then(data => {
        const { opTotal, tokenTotal, feeTotal } = data.result;
        setNetworkStats({
          opTotal: new Intl.NumberFormat('en-US').format(opTotal),
          tokenTotal: new Intl.NumberFormat('en-US').format(tokenTotal),
          feeTotal: new Intl.NumberFormat('en-US').format((feeTotal / 1e8).toFixed(0)), // Format feeTotal
        });
      })
      .catch(error => console.error('Error fetching network stats:', error));
  }, []);

  useEffect(() => {
    fetch('https://api.kasplex.org/v1/krc20/tokenlist')
      .then(response => response.json())
      .then(data => {
        const sortedTokens = data.result.sort((a, b) => b.mtsAdd - a.mtsAdd);
        setRecentTokens(sortedTokens.slice(0, 5)); // Display the 5 most recent tokens
      })
      .catch(error => console.error('Error fetching recent tokens:', error));
  }, []);

  return (
    <Container className="home">
      <Row className="header-section">
        <Col>
          <h1>KatScan</h1>
          <p>Explore, Analyze, and Compare KRC-20 Token Data</p>
        </Col>
      </Row>

      <Row className="features-section">
        <Col>
          <h2>Key Features</h2>
          <Row>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <Card.Title>Transaction Lookup</Card.Title>
                  <Card.Text>Search and analyze KRC-20 transactions.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <Card.Title>Address Lookup</Card.Title>
                  <Card.Text>Get detailed information about any wallet.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="feature-card">
                <Card.Body>
                  <Card.Title>Token Comparison</Card.Title>
                  <Card.Text>Compare different KRC-20 tokens side by side.</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="network-stats-section">
        <Col>
          <h2>Kasplex Statistics</h2>
          <Row>
            <Col md={4}>
              <Card className="stats-card">
                <Card.Body>
                  <FaExchangeAlt className="stats-icon" />
                  <Card.Title>{networkStats.opTotal}</Card.Title>
                  <Card.Text>Total KRC20 Transactions</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stats-card">
                <Card.Body>
                  <FaCoins className="stats-icon" />
                  <Card.Title>{networkStats.tokenTotal}</Card.Title>
                  <Card.Text>Total KRC20 Tokens Deployed</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="stats-card">
                <Card.Body>
                  <FaWallet className="stats-icon" />
                  <Card.Title>{networkStats.feeTotal}</Card.Title>
                  <Card.Text>Total Fees Paid (KAS)</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="recent-tokens-section">
        <Col>
          <h2>Recent Tokens</h2>
          <Row>
            {recentTokens.map(token => (
              <Col md={4} key={token.hashRev}>
                <Card className="token-card">
                  <Card.Body>
                    <Card.Title>{token.tick}</Card.Title>
                    <Card.Text>Max Supply: {new Intl.NumberFormat('en-US').format(token.max / Math.pow(10, token.dec))}</Card.Text>
                    <Card.Text>Minted: {new Intl.NumberFormat('en-US').format(token.minted / Math.pow(10, token.dec))}</Card.Text>
                    <Card.Text>Deployed on: {new Date(parseInt(token.mtsAdd)).toLocaleString()}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      <Row className="analytics-section">
        <Col>
          <h2>Analytics</h2>
          {/* Placeholder for analytics charts */}
          <p>Analytics charts will go here.</p>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
