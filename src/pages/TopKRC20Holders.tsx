import React, {FC, useEffect, useState} from 'react';
import {Alert, Button, Card, Table} from 'react-bootstrap';
import {FaChevronDown, FaChevronUp} from 'react-icons/fa';
import {Link} from 'react-router-dom';
import '../styles/TopKRC20Holders.css';
import {censorTicker} from '../utils/censorTicker';
import {useMediaQuery} from 'react-responsive';
import SEO from '../components/SEO';
import JsonLd from '../components/JsonLd';
import {LoadingSpinner} from "../components/LoadingSpinner";
import {simpleRequest} from "../services/RequestService";
import {TopHolder} from "../interfaces/TokenData";

const API_BASE_URL = 'https://katapi.nachowyborski.xyz/api/topHolders';
type InternalTopHolder = {
    address: string
    tokens: { tick: string, amount: number, decimals: number }[]
    uniqueTokens: number
}

type MobileView = {
    holders: InternalTopHolder[]
    expandedRows: Record<string, boolean>
    toggleRowExpansion: (address:string) => void
}

// todo Refactoring
const TopKRC20Holders: FC = () => {
    const [topHolders, setTopHolders] = useState<InternalTopHolder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
    const isMobile = useMediaQuery({maxWidth: 768});

    useEffect(() => {
        const fetchTopHolders = async () => {
            try {
                setLoading(true);
                const holders = await simpleRequest<TopHolder[]>(API_BASE_URL);

                const formattedHolders = holders.map(holder => ({
                    address: holder.address,
                    tokens: holder.balances.map(balance => ({
                        tick: balance.tick,
                        amount: parseFloat(balance.balance) / Math.pow(10, 8), // Assume 8 decimals for each token
                        decimals: 8 // Assume 8 decimals for each token
                    })),
                    uniqueTokens: holder.balances.length,
                }));

                // Sort by uniqueTokens, highest to lowest
                formattedHolders.sort((a, b) => b.uniqueTokens - a.uniqueTokens);

                setTopHolders(formattedHolders);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching top holders:', err);
                setError('Failed to fetch top holders data. Please try again later.');
                setLoading(false);
            }
        };

        void fetchTopHolders();
    }, []);

    const toggleRowExpansion = (address: string) => {
        setExpandedRows(prev => ({...prev, [address]: !prev[address]}));
    };


    const MobileView = ({holders, expandedRows, toggleRowExpansion}:MobileView) => {
        const shortenAddress = (address:string) => {
            return `${address.slice(0, 6)}...${address.slice(-5)}`;
        };

        return (
            <div className="mobile-holders-list">
                {holders.map((holder, index) => (
                    <Card key={holder.address} className="mb-3">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>Rank: {index + 1}</strong>
                                </div>
                                <div>
                                    <Link to={`/wallet/${holder.address}`} className="clickable-address">
                                        {shortenAddress(holder.address)}
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-2">
                                <strong>Unique Tokens:</strong> {holder.uniqueTokens}
                            </div>
                            <Button
                                variant="link"
                                onClick={() => toggleRowExpansion(holder.address)}
                                aria-expanded={expandedRows[holder.address]}
                                className="mt-2 p-0"
                            >
                                {expandedRows[holder.address] ? 'Hide Tokens' : 'Show Tokens'}
                                {expandedRows[holder.address] ? <FaChevronUp className="ml-1"/> :
                                    <FaChevronDown className="ml-1"/>}
                            </Button>
                            {expandedRows[holder.address] && (
                                <Table size="sm" className="mt-2">
                                    <thead>
                                    <tr>
                                        <th>Token</th>
                                        <th>Amount</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {holder.tokens.map(token => (
                                        <tr key={token.tick}>
                                            <td>{censorTicker(token.tick)}</td>
                                            <td>{token.amount.toLocaleString(undefined, {maximumFractionDigits: token.decimals})}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                ))}
            </div>
        );
    };

    if (loading) {
        return <LoadingSpinner/>
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <div className="top-krc20-holders-wrapper">
            <h1>Top KRC20 Token Holders</h1>
            <SEO
                title="Top KRC-20 Token Holders"
                description="Explore the top holders of KRC-20 tokens on the Kaspa blockchain, ranked by unique token holdings."
                keywords="KRC-20, Kaspa, top holders, token distribution, whale analysis"
            />
            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "WebApplication",
                    "name": "KatScan Top KRC-20 Token Holders",
                    "description": "Explore the top holders of KRC-20 tokens on the Kaspa blockchain, ranked by unique token holdings.",
                    "url": "https://katscan.xyz/top-holders"
                }}
            />
            {isMobile ? (
                <MobileView
                    holders={topHolders}
                    expandedRows={expandedRows}
                    toggleRowExpansion={toggleRowExpansion}
                />
            ) : (
                <div className="table-container">
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Address</th>
                            <th>Unique Tokens</th>
                            <th>Expand</th>
                        </tr>
                        </thead>
                        <tbody>
                        {topHolders.map((holder, index) => (
                            <React.Fragment key={holder.address}>
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>
                                        <Link to={`/wallet/${holder.address}`} className="clickable-address">
                                            {holder.address}
                                        </Link>
                                    </td>
                                    <td>{holder.uniqueTokens}</td>
                                    <td>
                                        <Button
                                            variant="link"
                                            onClick={() => toggleRowExpansion(holder.address)}
                                            aria-expanded={expandedRows[holder.address]}
                                        >
                                            {expandedRows[holder.address] ? 'Hide Tokens' : 'Show Tokens'}
                                            {expandedRows[holder.address] ? <FaChevronUp className="ml-1"/> :
                                                <FaChevronDown className="ml-1"/>}
                                        </Button>
                                    </td>
                                </tr>
                                {expandedRows[holder.address] && (
                                    <tr>
                                        <td colSpan={4}>
                                            <Table size="sm">
                                                <thead>
                                                <tr>
                                                    <th>Token</th>
                                                    <th>Amount</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {holder.tokens.map(token => (
                                                    <tr key={token.tick}>
                                                        <td>{censorTicker(token.tick)}</td>
                                                        <td>{token.amount.toLocaleString(undefined, {maximumFractionDigits: token.decimals})}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </Table>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </Table>
                </div>
            )}
        </div>
    );
};

export default TopKRC20Holders;
