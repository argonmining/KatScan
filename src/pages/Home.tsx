import React, {FC, useEffect, useState} from 'react';
import {Card, Col, Container, Row} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import {FaCalculator, FaChartBar, FaCoins, FaExchangeAlt, FaUsers, FaWallet} from 'react-icons/fa';
import 'styles/Home.css';
import {SEO, JsonLd, FeatureCard, StatCard, simpleRequest} from "nacho-component-library";
import {TokenListResponse} from "../interfaces/ApiResponseTypes";
import {TokenData} from "../interfaces/TokenData";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.kasplex.org/v1';

const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "KatScan Home",
    "description": "Explore KRC-20 tokens on the Kaspa blockchain",
    "url": "https://katscan.xyz"
};

export const Home: FC = () => {
    const [networkStats, setNetworkStats] = useState({
        opTotal: "0",
        tokenTotal: "0",
        feeTotal: "0",
    });

    const [recentTokens, setRecentTokens] = useState<TokenData[]>([]);

    useEffect(() => {
        // Fetch network stats
        simpleRequest<{ result: { opTotal: number, tokenTotal: number, feeTotal: number } }>(`${API_BASE_URL}/info`)
            .then(data => {
                const {opTotal, tokenTotal, feeTotal} = data.result;
                setNetworkStats({
                    opTotal: new Intl.NumberFormat('en-US').format(opTotal),
                    tokenTotal: new Intl.NumberFormat('en-US').format(tokenTotal),
                    feeTotal: new Intl.NumberFormat('en-US').format(parseFloat((feeTotal / 1e8).toFixed(0))),
                });
            })
            .catch(error => console.error('Error fetching network stats:', error));

        // Fetch recent tokens
        simpleRequest<TokenListResponse<TokenData[]>>(`${API_BASE_URL}/krc20/tokenlist`)
            .then(data => {
                const sortedTokens = data.result.sort((a, b) => Number(b.mtsAdd) - Number(a.mtsAdd));
                setRecentTokens(sortedTokens.slice(0, 6));
            })
            .catch(error => console.error('Error fetching recent tokens:', error));
    }, []);

    return (
        <>
            <JsonLd data={jsonLdData}/>
            <Container fluid className="home-container d-flex flex-column vh-100">
                <SEO
                    title="Home"
                    description="Explore, analyze, and compare KRC-20 tokens on the Kaspa blockchain with KatScan. Real-time data and insights for crypto enthusiasts and investors."
                    keywords="KRC-20, KRC20, KatScan, Kaspa, blockdag, kaspa explorer, krc20 explorer, kasplex explorer, kaspa blockchain, krc20 blockchain, kaspa tokens, krc20 tokens, kaspa transactions, krc20 transactions, kaspa statistics, krc20 statistics, kaspa network, krc20 network, kaspa development, krc20 development, kaspa statistics, krc20 statistics, kaspa network, krc20 network, kaspa development, krc20 development"
                />
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
                            <FeatureCard title="All Tokens" icon={<FaCoins className="feature-icon"/>} link="/tokens"/>
                            <FeatureCard title="Address Lookup" icon={<FaWallet className="feature-icon"/>}
                                         link="/wallet"/>
                            <FeatureCard title="Token Comparison" icon={<FaExchangeAlt className="feature-icon"/>}
                                         link="/compare"/>
                        </Row>
                        <Row className="mb-3">
                            <FeatureCard title="Top Holders" icon={<FaUsers className="feature-icon"/>}
                                         link="/top-holders"/>
                            <FeatureCard title="Mint Heatmap" icon={<FaChartBar className="feature-icon"/>}
                                         link="/mint-heatmap"/>
                            <FeatureCard title="MarketCap Calculator" icon={<FaCalculator className="feature-icon"/>}
                                         link="/marketcap-calc"/>
                        </Row>

                        <h5 className="section-title mb-2">Kasplex Statistics</h5>
                        <Row className="mb-4">
                            <StatCard
                                title="Total KRC20 Transactions"
                                value={networkStats.opTotal}
                                icon={<FaExchangeAlt className="stat-icon"/>}
                            />
                            <StatCard
                                title="Total KRC20 Tokens Deployed"
                                value={networkStats.tokenTotal}
                                icon={<FaCoins className="stat-icon"/>}
                            />
                            <StatCard
                                title="Total Fees Paid (KAS)"
                                value={networkStats.feeTotal}
                                icon={<FaWallet className="stat-icon"/>}
                            />
                        </Row>

                        <h5 className="section-title mb-2">Recently Deployed Tokens</h5>
                        <Row>
                            {recentTokens.map(token => (
                                <Col xs={4} key={token.hashRev} className="mb-4">
                                    <Card className="token-card h-100" as={Link} to={`/tokens/${token.tick}`}>
                                        <Card.Body className="p-2">
                                            <Card.Title className="small mb-1">{token.tick}</Card.Title>
                                            <Card.Text
                                                className="small mb-0">Max: {new Intl.NumberFormat('en-US', {notation: 'compact'}).format(token.max / Math.pow(10, token.dec))}</Card.Text>
                                            <Card.Text
                                                className="small mb-0">Minted: {new Intl.NumberFormat('en-US', {notation: 'compact'}).format(token.minted / Math.pow(10, token.dec))}</Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Home;