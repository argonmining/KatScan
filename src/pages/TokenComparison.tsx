/* eslint-disable */
// @ts-nocheck
import React, {FC, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Badge, Card, Col, Form, ProgressBar, Row} from 'react-bootstrap';
import {Bar} from 'react-chartjs-2';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LogarithmicScale,
    Title,
    Tooltip
} from 'chart.js';
import {getTokenDetails} from '../services/dataService';
import 'styles/TokenComparison.css';
import {FaChartBar, FaChartPie, FaUsers} from 'react-icons/fa'; // Import icons
import {censorTicker} from '../utils/censorTicker';
import {JsonLd, LoadingSpinner, Page, SEO} from "nacho-component-library";
import {TokenData, TokenHolder} from "../interfaces/TokenData";
import {addAlert} from "../components/alerts/Alerts";
import {CustomSelect, Selection} from "../components/select/CustomSelect";
import {useFetch} from "../hooks/useFetch";
import {emptyArray} from "../utils/StaticVariables";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    LogarithmicScale
);
type TokenInternal = TokenHolder & {
    top10HoldersPercentage: number
    top50HoldersPercentage: number
    totalHolders: number
    hasHolderData: boolean
}

const TOKEN_COLORS = {
    token1: 'rgba(75, 192, 192, 0.6)',  // Teal
    token2: 'rgba(255, 99, 132, 0.6)',  // Pink
};

const HOLDER_GROUP_COLORS = {
    top10: 'rgba(255, 99, 132, 0.6)',   // Red
    top50: 'rgba(255, 206, 86, 0.6)',   // Yellow
    others: 'rgba(75, 192, 192, 0.6)',  // Green
};
//todo refactor
const TokenComparison: FC = () => {
    const [selectedTokens, setSelectedTokens] = useState<[Selection, Selection] | [null, null]>([null, null]);
    const [tokenDetails, setTokenDetails] = useState<TokenInternal[]>([]);
    const [compoareLoading, setCompareLoading] = useState(false)
    const {data, loading, error} = useFetch<TokenData['tick'][]>({
        url: '/token/tickers',
        defaultValue: emptyArray
    })

    const supplyChartRef = useRef(null);
    const holdersChartRef = useRef(null);

    const calculateValue = useCallback((value: number, decimals: number) => {
        if (value === undefined || decimals === undefined) {
            console.warn('calculateValue received undefined value or decimals');
            return 0;
        }
        return parseFloat(value.toString()) / Math.pow(10, parseInt(decimals.toString()));
    }, []);

    const calculateHolderPercentages = useCallback((token: TokenHolder) => {
        if (!token.holder || !Array.isArray(token.holder) || token.holder.length === 0) {
            console.warn(`No holder data for token: ${token.tick}`);
            return {
                top10HoldersPercentage: 0,
                top50HoldersPercentage: 0,
                totalHolders: parseInt(token.holderTotal) || 0,
                hasHolderData: false
            };
        }

        const totalSupply = calculateValue(token.minted, token.dec);
        const sortedHolders = [...token.holder].sort((a, b) => parseInt(b.amount.toString()) - parseInt(a.amount.toString()));

        const top10Amount = sortedHolders.slice(0, 10).reduce((sum, holder) => sum + calculateValue(holder.amount, token.dec), 0);
        const top50Amount = sortedHolders.slice(0, 50).reduce((sum, holder) => sum + calculateValue(holder.amount, token.dec), 0);

        const top10Percentage = (top10Amount / totalSupply) * 100;
        const top50Percentage = (top50Amount / totalSupply) * 100;

        return {
            top10HoldersPercentage: top10Percentage,
            top50HoldersPercentage: top50Percentage,
            totalHolders: parseInt(token.holderTotal) || sortedHolders.length,
            hasHolderData: true
        };
    }, [calculateValue]);

    useEffect(() => {
        if (!selectedTokens[0] || !selectedTokens[1]) {
            return
        }
        const fetchTokenDetails = async () => {
            setCompareLoading(true);
            try {
                const details = await Promise.all(selectedTokens.map(token => getTokenDetails(token.value as string)));
                console.log('Raw token details:', details);
                const processedDetails: TokenInternal[] = details.map(token => ({
                    ...token.result,
                    ...calculateHolderPercentages(token.result)
                }));
                console.log('Processed token details:', processedDetails);
                setTokenDetails(processedDetails);
            } catch (err) {
                console.error('Error fetching token details:', err);
                addAlert('error', `Failed to fetch token details: ${(err as Record<string, string>).message}`);
                setTokenDetails([]);
            }
            setCompareLoading(false);
        };

        void fetchTokenDetails();
    }, [selectedTokens, calculateHolderPercentages]);

    const handleTokenSelect = (option, index) => {
        setSelectedTokens(prev => {
            const newSelected = [...prev];
            newSelected[index] = option;
            return newSelected;
        });
    };

    const renderComparison = () => {
        console.log('Rendering comparison, tokenDetails:', tokenDetails);

        if (!tokenDetails[0] || !tokenDetails[1]) {
            console.log('One or both tokens are missing');
            return <p>Please select two tokens to compare.</p>;
        }

        const [token1, token2] = tokenDetails;

        const calculateValue = (value, decimals) => {
            if (value === undefined || decimals === undefined) return 0;
            return parseFloat(value) / Math.pow(10, parseInt(decimals));
        };

        const formatNumber = (num: number): string => {
            if (num === undefined || isNaN(num)) {
                console.warn('formatNumber received invalid number:', num);
                return 'N/A';
            }
            return num.toLocaleString();
        };

        const formatLargeNumber = (num: number): string => {
            if (num >= 1e12) {
                return (num / 1e12).toFixed(3) + ' T';
            } else if (num >= 1e9) {
                return (num / 1e9).toFixed(3) + ' B';
            } else if (num >= 1e6) {
                return (num / 1e6).toFixed(3) + ' M';
            } else if (num >= 1e3) {
                return (num / 1e3).toFixed(3) + ' K';
            } else {
                return num.toLocaleString();
            }
        };

        const supplyData = {
            labels: ['Max Supply', 'Minted', 'Pre-Minted'],
            datasets: [
                {
                    label: censorTicker(token1.tick),
                    data: [
                        calculateValue(token1.max, token1.dec),
                        calculateValue(token1.minted, token1.dec),
                        calculateValue(token1.pre, token1.dec)
                    ],
                    backgroundColor: TOKEN_COLORS.token1,
                },
                {
                    label: censorTicker(token2.tick),
                    data: [
                        calculateValue(token2.max, token2.dec),
                        calculateValue(token2.minted, token2.dec),
                        calculateValue(token2.pre, token2.dec)
                    ],
                    backgroundColor: TOKEN_COLORS.token2,
                },
            ],
        };

        const supplyOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'logarithmic',
                    ticks: {
                        callback: function (value: number) {
                            return formatLargeNumber(value);
                        },
                        maxTicksLimit: 8
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                },
            },
        };

        const holdersData = {
            labels: [censorTicker(token1.tick), censorTicker(token2.tick)],
            datasets: [
                {
                    label: 'Top 10 Holders',
                    data: [token1.top10HoldersPercentage || 0, token2.top10HoldersPercentage || 0],
                    backgroundColor: HOLDER_GROUP_COLORS.top10,
                },
                {
                    label: 'Top 11-50 Holders',
                    data: [
                        (token1.top50HoldersPercentage || 0) - (token1.top10HoldersPercentage || 0),
                        (token2.top50HoldersPercentage || 0) - (token2.top10HoldersPercentage || 0)
                    ],
                    backgroundColor: HOLDER_GROUP_COLORS.top50,
                },
                {
                    label: 'Other Holders',
                    data: [
                        100 - (token1.top50HoldersPercentage || 0),
                        100 - (token2.top50HoldersPercentage || 0)
                    ],
                    backgroundColor: HOLDER_GROUP_COLORS.others,
                },
            ],
        };

        const holdersOptions = {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', {
                                    style: 'percent',
                                    minimumFractionDigits: 2
                                }).format(context.parsed.y / 100);
                            }
                            return label;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                },
            },
            responsive: true,
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        font: {
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        callback: function (value: string) {
                            return value + '%';
                        }
                    }
                }
            },
        };

        const getMintProgress = (token: TokenData) => {
            const minted = calculateValue(token.minted, token.dec);
            const max = calculateValue(token.max, token.dec);
            return max > 0 ? (minted / max) * 100 : 0;
        };

        const getMintType = (token: TokenData) => {
            return calculateValue(token.pre, token.dec) > 0 ? "Pre-Mint" : "Fair Mint";
        };

        return (
            <Row>
                <Col lg={6} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title><FaChartBar/> Supply Comparison</Card.Title>
                            <Bar data={supplyData} options={supplyOptions} ref={supplyChartRef}/>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6} className="mb-4">
                    <Card>
                        <Card.Body>
                            <Card.Title><FaUsers/> Holder Distribution</Card.Title>
                            <Bar data={holdersData} options={holdersOptions} ref={holdersChartRef}/>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={12} className="mb-4 minting-progress-card">
                    <Card>
                        <Card.Body>
                            <Card.Title><FaChartPie/> Minting Progress</Card.Title>
                            <div className="progress-wrapper mb-3">
                                <div className="progress-label">
                                    {censorTicker(token1.tick)} <Badge
                                    bg={getMintType(token1) === "Fair Mint" ? "success" : "warning"}>{getMintType(token1)}</Badge>
                                </div>
                                <ProgressBar
                                    now={getMintProgress(token1)}
                                    label={`${getMintProgress(token1).toFixed(2)}%`}
                                    variant="info"
                                />
                            </div>
                            <div className="progress-wrapper">
                                <div className="progress-label">
                                    {censorTicker(token2.tick)} <Badge
                                    bg={getMintType(token2) === "Fair Mint" ? "success" : "warning"}>{getMintType(token2)}</Badge>
                                </div>
                                <ProgressBar
                                    now={getMintProgress(token2)}
                                    label={`${getMintProgress(token2).toFixed(2)}%`}
                                    variant="success"
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={12}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Token Details</Card.Title>
                            <table className="table">
                                <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>{censorTicker(token1.tick)}</th>
                                    <th>{censorTicker(token2.tick)}</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>Max Supply</td>
                                    <td>{formatNumber(calculateValue(token1.max, token1.dec))}</td>
                                    <td>{formatNumber(calculateValue(token2.max, token2.dec))}</td>
                                </tr>
                                <tr>
                                    <td>Minted</td>
                                    <td>{formatNumber(calculateValue(token1.minted, token1.dec))}</td>
                                    <td>{formatNumber(calculateValue(token2.minted, token2.dec))}</td>
                                </tr>
                                <tr>
                                    <td>Pre-Minted</td>
                                    <td>{formatNumber(calculateValue(token1.pre, token1.dec))}</td>
                                    <td>{formatNumber(calculateValue(token2.pre, token2.dec))}</td>
                                </tr>
                                <tr>
                                    <td>Total Holders</td>
                                    <td>{formatNumber(token1.holderTotal)}</td>
                                    <td>{formatNumber(token2.holderTotal)}</td>
                                </tr>
                                <tr>
                                    <td>Top 10 Holders %</td>
                                    <td>{(token1.top10HoldersPercentage || 0).toFixed(2)}%</td>
                                    <td>{(token2.top10HoldersPercentage || 0).toFixed(2)}%</td>
                                </tr>
                                <tr>
                                    <td>Top 50 Holders %</td>
                                    <td>{(token1.top50HoldersPercentage || 0).toFixed(2)}%</td>
                                    <td>{(token2.top50HoldersPercentage || 0).toFixed(2)}%</td>
                                </tr>
                                </tbody>
                            </table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        );
    };

    useEffect(() => {
        const supplyChart = supplyChartRef.current;
        const holdersChart = holdersChartRef.current;

        return () => {
            if (supplyChart) {
                supplyChart.destroy();
            }
            if (holdersChart) {
                holdersChart.destroy();
            }
        };
    }, []);

    const searchValues = useMemo((): Selection[] =>
            data.map(token => ({value: token, label: censorTicker(token)}))
        , [data])

    return (
        <Page header={'Compare KRC20 Tokens'}>
            <div className="token-comparison">
                <SEO
                    title="Token Comparison"
                    description="Compare KRC-20 tokens on the Kaspa blockchain side by side, analyzing key metrics and holder distributions."
                    keywords="KRC-20, Kaspa, token comparison, cryptocurrency analysis"
                />
                <JsonLd
                    data={{
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "KatScan Token Comparison",
                        "description": "Compare KRC-20 tokens on the Kaspa blockchain side by side, analyzing key metrics and holder distributions.",
                        "url": "https://katscan.xyz/compare"
                    }}
                />
                <Row className="mb-4">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Select Token 1</Form.Label>
                            <CustomSelect placeholder={"Search for a token..."} data={searchValues} hasSearch={true}
                                          onSelect={(option) => handleTokenSelect(option, 0)}/>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Select Token 2</Form.Label>
                            <CustomSelect placeholder={"Search for a token..."} data={searchValues} hasSearch={true}
                                          onSelect={(option) => handleTokenSelect(option, 1)}/>
                        </Form.Group>
                    </Col>
                </Row>
                {loading && <LoadingSpinner useFlexHeight={true}/>}
                {!compoareLoading && !error && tokenDetails[0] && tokenDetails[1] && renderComparison()}
            </div>
        </Page>
    );
};

export default TokenComparison;
