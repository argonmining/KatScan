import React, {FC, useEffect, useMemo, useState} from 'react';
import {Link} from 'react-router-dom';
import {Dropdown, Form, InputGroup, Table} from 'react-bootstrap';
import {FaSearch} from 'react-icons/fa';
import {getKRC20TokenList} from '../services/dataService';
import 'styles/TokenOverview.css';
import {censorTicker} from '../utils/censorTicker';
import JsonLd from '../components/JsonLd';
import SEO from '../components/SEO';
import {LoadingSpinner} from "../components/LoadingSpinner";
import {TokenData} from "../interfaces/TokenData";
import {SmallThumbnail} from "../components/Image";
import {iconBaseUrl} from "../utils/StaticVariables";

const ITEMS_PER_PAGE = 50;

const TokenOverview: FC = () => {
    const [tokens, setTokens] = useState<TokenData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<keyof TokenData | ''>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [launchTypeFilter, setLaunchTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showLaunchTypeDropdown, setShowLaunchTypeDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    useEffect(() => {
        const fetchAllTokens = async (): Promise<void> => {
            try {
                setLoading(true);
                const data = await getKRC20TokenList(ITEMS_PER_PAGE, sortField, sortDirection);
                setTokens(data.result);
                setLoading(false);
            } catch (err) {
                console.error('Error in TokenOverview:', err);
                setError(`Failed to fetch tokens: ${(err as Record<string, string>).message}`);
                setLoading(false);
            }
        }
        void fetchAllTokens();
    }, [sortField, sortDirection])

    const handleSort = (field: keyof TokenData): void => {
        if (field === sortField) {
            setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleLaunchTypeSelect = (eventKey: string): void => {
        setLaunchTypeFilter(eventKey);
        setShowLaunchTypeDropdown(false);
    };

    const handleStatusSelect = (eventKey: string): void => {
        setStatusFilter(eventKey);
        setShowStatusDropdown(false);
    };

    const calculateValue = (value: number, decimals: number): number => {
        return value / Math.pow(10, decimals);
    };

    const calculatePercentage = (part: number, whole: number): number => {
        return (part / whole) * 100;
    };

    const filteredAndSortedTokens = useMemo(() => {
        let result = tokens;

        // Filter by search term
        if (searchTerm) {
            result = result.filter(token =>
                token.tick.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by launch type
        if (launchTypeFilter) {
            result = result.filter(token =>
                (token.pre === '0' ? 'Fair Mint' : 'Pre-Mint') === launchTypeFilter
            );
        }

        // Filter by status
        if (statusFilter) {
            result = result.filter(token =>
                (token.state === 'finished' ? 'Complete' : 'Minting') === statusFilter
            );
        }

        // Sort
        if (sortField) {
            result.sort((a, b) => {
                if (sortField === 'minted') {
                    const aPercentage = calculatePercentage(calculateValue(a.minted, a.dec), calculateValue(a.max, a.dec));
                    const bPercentage = calculatePercentage(calculateValue(b.minted, b.dec), calculateValue(b.max, b.dec));
                    if (aPercentage < bPercentage) return sortDirection === 'asc' ? -1 : 1;
                    if (aPercentage > bPercentage) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                } else {
                    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
                    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                }
            });
        }

        return result;
    }, [tokens, searchTerm, sortField, sortDirection, launchTypeFilter, statusFilter]);

    const formatNumber = (value: number, decimals = 2): string => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: decimals,
        }).format(value);
    };

    const formatState = (state: string): string => {
        return state === 'finished' ? 'Complete' : 'Minting';
    };

    const formatDateTime = (timestamp: number): string => {
        return new Date(parseInt(String(timestamp))).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        });
    };

    const formatPercentage = (value: number, max: number): string => {
        const percentage = (value / max) * 100;
        const formattedPercentage = percentage < 1 && percentage > 0 ? '<1' : Math.round(percentage);
        return `(${formattedPercentage}%)`;
    };

    const getBadgeClass = (preMint: string): string => {
        return preMint === '0' ? 'badge badge-fair-mint' : 'badge badge-pre-mint';
    };

    const formatPreMinted = (preMinted: string, max: number, decimals: number): string => {
        const value = calculateValue(parseInt(preMinted), decimals);
        if (value === 0) return "None";
        return `${formatNumber(value)} ${formatPercentage(value, calculateValue(max, decimals))}`;
    };

    if (loading) return <LoadingSpinner/>
    if (error) return <div className="token-overview error">Error: {error}</div>;

    const jsonLdData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "KRC-20 Tokens Overview | KatScan",
        "description": "Overview of all KRC-20 tokens on the Kaspa blockchain.",
        "url": "https://katscan.xyz/tokens",
    };

    return (
        <div className="token-overview">
            <div className="token-overview-header">
                <h2>All KRC-20 Tokens</h2>
                <Form.Group className="search-form">
                    <InputGroup>
                        <InputGroup.Text><FaSearch/></InputGroup.Text>
                        <Form.Control
                            type="text"
                            placeholder="Search by ticker..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </InputGroup>
                </Form.Group>
            </div>
            <div className="table-wrapper">
                <Table>
                    <thead>
                    <tr>
                        <th style={{width: '50px'}}/>
                        <th className="sticky-column"
                            onClick={() => handleSort('tick')}>Ticker {sortField === 'tick' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                        <th className="text-center">
                            <Dropdown show={showLaunchTypeDropdown}
                                      onToggle={() => setShowLaunchTypeDropdown(!showLaunchTypeDropdown)}>
                                <Dropdown.Toggle as="div" className="dropdown-header">
                                    Launch Type
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleLaunchTypeSelect("")}>All</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleLaunchTypeSelect("Fair Mint")}>Fair
                                        Mint</Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => handleLaunchTypeSelect("Pre-Mint")}>Pre-Mint</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </th>
                        <th>
                            <Dropdown show={showStatusDropdown}
                                      onToggle={() => setShowStatusDropdown(!showStatusDropdown)}>
                                <Dropdown.Toggle as="div" className="dropdown-header">
                                    Status
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={() => handleStatusSelect("")}>All</Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={() => handleStatusSelect("Complete")}>Complete</Dropdown.Item>
                                    <Dropdown.Item onClick={() => handleStatusSelect("Minting")}>Minting</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </th>
                        <th onClick={() => handleSort('max')}>Max
                            Supply {sortField === 'max' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                        <th onClick={() => handleSort('pre')}>Pre-Minted {sortField === 'pre' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                        <th onClick={() => handleSort('minted')}>Total
                            Minted {sortField === 'minted' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                        <th className="text-center">Minting Progress</th>
                        <th onClick={() => handleSort('mtsAdd')} className="text-right">Deployed
                            On {sortField === 'mtsAdd' && (sortDirection === 'asc' ? '▲' : '▼')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredAndSortedTokens.length > 0 ? (
                        filteredAndSortedTokens.map((token) => (
                            <tr key={token.tick}>
                                <td>
                                    <div style={{width: '30px', overflow: 'hidden'}}>
                                        <Link to={`/tokens/${token.tick}`} className="token-ticker">
                                            <SmallThumbnail src={`${iconBaseUrl}${token.tick}.jpg`}
                                                            alt={token.tick}
                                                            loading="lazy"/>
                                        </Link>
                                    </div>
                                </td>
                                <td className="sticky-column">
                                    <Link to={`/tokens/${token.tick}`} className="token-ticker">
                                        {censorTicker(token.tick)}
                                    </Link>
                                </td>
                                <td className="text-center">
                    <span className={getBadgeClass(token.pre)}>
                      {token.pre === '0' ? 'Fair Mint' : 'Pre-Mint'}
                    </span>
                                </td>
                                <td>{formatState(token.state)}</td>
                                <td>{formatNumber(calculateValue(token.max, token.dec))}</td>
                                <td>
                                    {formatPreMinted(token.pre, token.max, token.dec)}
                                </td>
                                <td>
                                    {formatNumber(calculateValue(token.minted, token.dec))}
                                    {' '}
                                    <small
                                        className="text-muted">{formatPercentage(calculateValue(token.minted, token.dec), calculateValue(token.max, token.dec))}</small>
                                </td>
                                <td className="text-center">
                                    <div className="progress">
                                        <div
                                            className="progress-bar"
                                            style={{width: `${calculatePercentage(calculateValue(token.minted, token.dec), calculateValue(token.max, token.dec))}%`}}
                                        ></div>
                                    </div>
                                </td>
                                <td className="text-right">{formatDateTime(token.mtsAdd)}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={8} className="text-center">
                                {loading ? 'Loading...' : 'No tokens to display'}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>
            </div>
            <JsonLd data={jsonLdData}/>
            <SEO
                title="Token Overview"
                description="Explore and analyze all KRC-20 tokens on the Kaspa blockchain."
                keywords="KRC-20, Kaspa, token overview, cryptocurrency, blockchain"
            />
        </div>
    );
};

export default TokenOverview;