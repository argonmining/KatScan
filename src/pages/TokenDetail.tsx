/*eslint-disable*/
//@ts-nocheck
import React, {FC, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Alert, Card, Tab, Table, Tabs} from 'react-bootstrap';
import {Bar, Line} from 'react-chartjs-2';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS, ChartDatasetProperties,
    Legend,
    LegendItem,
    LinearScale,
    LineElement,
    LogarithmicScale,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import {getTokenDetails, getTokenOperations} from '../services/dataService';
import '../styles/TokenDetail.css';
import {censorTicker} from '../utils/censorTicker';
import SEO from '../components/SEO';
import JsonLd from '../components/JsonLd';
import {LinkWithTooltip} from '../components/LinkWithTooltip';
import {LoadingSpinner} from "../components/LoadingSpinner";
import {OpTransactionData} from "../interfaces/OpTransactionData";
import {simpleRequest} from "../services/RequestService";
import {TokenSearchResult} from "../interfaces/TokenData";
import {MobileOperationsTable} from "../components/tables/MobileOperationsTable";
import {MobileHolderTable} from "../components/tables/MobileHolderTable";
import {formatDateTime, formatNumber, parseRawNumber} from "../services/Helper";
import {useMobile} from "../hooks/mobile";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, LogarithmicScale);

const shortenString = (str: string, startLength = 5, endLength = 5): string => {
    if (str.length <= startLength + endLength) return str;
    return `${str.slice(0, startLength)}...${str.slice(-endLength)}`;
};

// todo refactoring
const TokenDetail: FC = () => {
    const {tokenId} = useParams();
    const navigate = useNavigate();
    const [tokenData, setTokenData] = useState<TokenSearchResult | null>(null);
    const [operations, setOperations] = useState<OpTransactionData[]>([]);
    const [operationsCursor, setOperationsCursor] = useState<OpTransactionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [operationsError, setOperationsError] = useState<string | null>(null);
    const observer = useRef<IntersectionObserver>();
    const [mintActivity, setMintActivity] = useState<unknown[]>([]);
    const [activeTab, setActiveTab] = useState('topHolders');
    const {isMobile} = useMobile()

    const fetchOperations = useCallback(async () => {
        if (loadingMore || !operationsCursor || tokenId === undefined) return;
        try {
            setLoadingMore(true);
            setOperationsError(null);
            // eslint-disable-next-line
            // @ts-ignore
            const data = await getTokenOperations(tokenId, 50, operationsCursor);
            setOperations(prevOps => [...prevOps, ...data]);
            //todo
            // setOperationsCursor(data.next);
        } catch (err) {
            console.error('Failed to fetch operations:', err);
            setOperationsError('Failed to load more operations. Please try again.');
        } finally {
            setLoadingMore(false);
        }
    }, [tokenId, operationsCursor, loadingMore]);

    const lastOperationElementRef = useCallback((node: HTMLTableRowElement) => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && operationsCursor) {
                void fetchOperations();
            }
        });
        if (node) observer.current?.observe(node);
    }, [loadingMore, operationsCursor, fetchOperations]);

    const holderDistribution = useMemo(() => {
        if (tokenData === null) {
            return []
        }

        if (tokenData.holder.length === 0) {
            return [
                {
                    label: 'Other Holders',
                    percentage: 100,
                }
            ];
        }
        const holders = tokenData.holder
        const decimals = tokenData.dec
        const maxSupply = tokenData.max

        const groups = [
            {label: 'Top 1-10 Holders', total: 0},
            {label: 'Top 11-20 Holders', total: 0},
            {label: 'Top 21-30 Holders', total: 0},
            {label: 'Top 31-40 Holders', total: 0},
            {label: 'Top 41-50 Holders', total: 0},
        ];

        holders.slice(0, 50).forEach((holder, index) => {
            const groupIndex = Math.floor(index / 10);
            groups[groupIndex].total += parseRawNumber(holder.amount.toString(), decimals);
        });

        const top50Total = groups.reduce((sum, group) => sum + group.total, 0);
        const otherHoldersTotal = parseRawNumber(maxSupply.toString(), decimals) - top50Total;

        return [
            ...groups.map(group => ({
                label: group.label,
                percentage: (group.total / parseRawNumber(maxSupply.toString(), decimals)) * 100,
            })),
            {
                label: 'Other Holders',
                percentage: (otherHoldersTotal / parseRawNumber(maxSupply.toString(), decimals)) * 100,
            }
        ];
    }, [tokenData]);

    useEffect(() => {
        if (!tokenId) {
            return
        }

        setLoading(true);
        setError(null);

        getTokenDetails(tokenId)
            .then(async (data) => {
                if (!data) {
                    throw new Error('No data returned from API');
                }
                const opsData = await getTokenOperations(tokenId, 50)
                setTokenData(data);
                setOperations(opsData);
                // todo next?
                // setOperationsCursor(opsData.next);
            })
            .catch(err => {
                console.error('Failed to fetch token details:', err);
                setError('Failed to fetch token details');
            })
            .finally(() => setLoading(false));

    }, [tokenId]);

    useEffect(() => {
        if (activeTab !== 'mintActivity' && mintActivity.length !== 0) {
            return
        }
        if (!tokenData) {
            return
        }

        //todo type
        simpleRequest<Record<string, string>[]>(`http://152.53.38.82:3000/api/mintsovertime?tick=${tokenData.tick.toUpperCase()}`)
            .then(data => {
                if (data.length === 0) {
                    return
                }
                const filledData = [];
                const startDate = new Date(data[data.length - 1].date);
                const endDate = new Date();
                const dateMap = new Map(data.map(item => [item.date, item.count]));

                // Add a date one day before the oldest record with a count of 0
                const preStartDate = new Date(startDate);
                preStartDate.setDate(preStartDate.getDate() - 1);
                filledData.push({date: preStartDate.toISOString().split('T')[0], count: 0});

                for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    filledData.push({date: dateStr, count: dateMap.get(dateStr) || 0});
                }
                setMintActivity(filledData)
            })
            .catch(error => {
                console.error('Failed to fetch mint activity data:', error);
            })
    }, [activeTab, mintActivity.length, tokenData]);

    const handleAddressClick = (address: string) => {
        navigate(`/wallet/${address}`);
    };

    const handleTransactionClick = (hashRev: string) => {
        navigate(`/transaction-lookup/${hashRev}`);
    };

    if (loading) return <LoadingSpinner/>
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!tokenData) return <Alert variant="warning">No data available</Alert>;

    const jsonLdData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": `${tokenData.tick} Token Details | KatScan`,
        "description": `Detailed information about the KRC-20 token ${tokenData.tick} on the Kaspa blockchain.`,
        "url": `https://katscan.xyz/tokens/${tokenId}`,
    };

    return (
        <div className="token-detail">
            <JsonLd data={jsonLdData}/>
            <SEO
                title="Token Details"
                description="Explore detailed information about a specific KRC-20 token on the Kaspa blockchain."
                keywords="KRC-20, Kaspa, token details, blockchain explorer, token information"
            />
            <div className="token-header">
                <h1>Token Details: {censorTicker(tokenData.tick)}</h1>
                <span className="creation-date">
          Deployed on {formatDateTime(tokenData.mtsAdd.toString())}
        </span>
            </div>
            <Card className="token-info-card">
                <Card.Body>
                    <div className="token-info-grid">
                        <div className="token-info-item">
                            <span className="token-info-label">Max Supply</span>
                            <span
                                className="token-info-value">{formatNumber(parseRawNumber(tokenData.max, tokenData.dec), tokenData.dec)}</span>
                        </div>
                        <div className="token-info-item">
                            <span className="token-info-label">Total Minted</span>
                            <span
                                className="token-info-value">{formatNumber(parseRawNumber(tokenData.minted, tokenData.dec), tokenData.dec)}</span>
                        </div>
                        <div className="token-info-item">
                            <span className="token-info-label">Limit per Mint</span>
                            <span
                                className="token-info-value">{formatNumber(parseRawNumber(tokenData.lim, tokenData.dec), tokenData.dec)}</span>
                        </div>
                        <div className="token-info-item">
                            <span className="token-info-label">Total Mints</span>
                            <span className="token-info-value">{formatNumber(tokenData.mintTotal, 0)}</span>
                        </div>
                        <div className="token-info-item">
                            <span className="token-info-label">Total Holders</span>
                            <span className="token-info-value">{formatNumber(tokenData.holderTotal, 0)}</span>
                        </div>
                        <div className="token-info-item">
                            <span className="token-info-label">Total Transfers</span>
                            <span className="token-info-value">{formatNumber(tokenData.transferTotal, 0)}</span>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Tabs defaultActiveKey="topHolders" className="mb-3" onSelect={(k) => setActiveTab(k)}>
                <Tab eventKey="topHolders" title="Top Holders">
                    <div className="detail-table-container">
                        {isMobile ? (
                            <MobileHolderTable
                                data={tokenData.holder}
                                tokenData={tokenData}
                                formatNumber={formatNumber}
                                parseRawNumber={parseRawNumber}
                                shortenString={shortenString}
                            />
                        ) : (
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Address</th>
                                    <th>Amount</th>
                                    <th>% of Total Supply</th>
                                </tr>
                                </thead>
                                <tbody>
                                {tokenData.holder && tokenData.holder.map((holder, index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <LinkWithTooltip
                                                to={`/wallet/${holder.address}`}
                                                tooltip="View wallet details"
                                                className="clickable-address"
                                            >
                                                {holder.address}
                                            </LinkWithTooltip>
                                        </td>
                                        <td>{formatNumber(parseRawNumber(holder.amount, tokenData.dec), tokenData.dec)}</td>
                                        <td>
                                            {((parseRawNumber(holder.amount, tokenData.dec) / parseRawNumber(tokenData.max, tokenData.dec)) * 100).toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        )}
                    </div>
                    <p className="mt-3 text-muted">
                        Note: Only top holders are displayed. The total number of holders
                        is {formatNumber(tokenData.holderTotal, 0)}.
                    </p>
                </Tab>
                <Tab eventKey="recentOperations" title="Recent Operations">
                    <div className="detail-table-container">
                        {isMobile ? (
                            <MobileOperationsTable
                                data={operations}
                                tokenData={tokenData}
                                handleAddressClick={handleAddressClick}
                                handleTransactionClick={handleTransactionClick}
                                formatNumber={formatNumber}
                                parseRawNumber={parseRawNumber}
                                formatDateTime={formatDateTime}
                                shortenString={shortenString}
                            />
                        ) : (
                            <Table striped bordered hover>
                                <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Transaction ID</th>
                                    <th>Address</th>
                                    <th>Amount</th>
                                    <th>Timestamp</th>
                                </tr>
                                </thead>
                                <tbody>
                                {operations && operations.map((op, index) => (
                                    <tr key={index}
                                        ref={index === operations.length - 1 ? lastOperationElementRef : null}>
                                        <td>{op.op}</td>
                                        <td>
                                            <LinkWithTooltip
                                                to={`/transaction-lookup/${op.hashRev}`}
                                                tooltip="View transaction details"
                                                className="clickable-address"
                                            >
                                                {op.hashRev}
                                            </LinkWithTooltip>
                                        </td>
                                        <td>
                                            <LinkWithTooltip
                                                to={`/wallet/${op.op === 'mint' ? op.to : op.from}`}
                                                tooltip="View wallet details"
                                                className="clickable-address"
                                            >
                                                {op.op === 'mint' ? op.to : op.from}
                                            </LinkWithTooltip>
                                        </td>
                                        <td>{formatNumber(parseRawNumber(op.amt, tokenData.dec), tokenData.dec)}</td>
                                        <td>{formatDateTime(op.mtsAdd)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                        )}
                    </div>
                    {loadingMore && <div>Loading more operations...</div>}
                    {operationsError && <Alert variant="danger">{operationsError}</Alert>}
                    {!operationsCursor && !loadingMore && <div>No more operations to load.</div>}
                </Tab>

                <Tab eventKey="holderDistribution" title="Holder Distribution">
                    <div className="chart-container">
                        {isMobile ? (
                            <div className="mobile-holder-distribution">
                                <table className="table table-striped">
                                    <thead>
                                    <tr>
                                        <th>Holder Group</th>
                                        <th>Percentage</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {holderDistribution.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.label}</td>
                                            <td>{item.percentage.toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <Bar
                                data={{
                                    labels: holderDistribution.map(item => item.label),
                                    datasets: [{
                                        label: 'Percentage of Max Supply',
                                        data: holderDistribution.map(item => item.percentage),
                                        backgroundColor: [
                                            'rgba(255, 99, 132, 0.2)',
                                            'rgba(54, 162, 235, 0.2)',
                                            'rgba(255, 206, 86, 0.2)',
                                            'rgba(75, 192, 192, 0.2)',
                                            'rgba(153, 102, 255, 0.2)',
                                            'rgba(201, 203, 207, 0.2)',
                                        ],
                                        borderColor: [
                                            'rgba(255, 99, 132, 1)',
                                            'rgba(54, 162, 235, 1)',
                                            'rgba(255, 206, 86, 1)',
                                            'rgba(75, 192, 192, 1)',
                                            'rgba(153, 102, 255, 1)',
                                            'rgba(201, 203, 207, 1)',
                                        ],
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'right',
                                            labels: {
                                                boxWidth: 20,
                                                padding: 15,
                                                generateLabels: (chart): LegendItem[] => {
                                                    const data = chart.data;
                                                    if (data.labels?.length && data.datasets.length) {
                                                        return data.labels?.map((label, i) => {
                                                            const value = data.datasets[0].data[i];
                                                            // eslint-disable-next-line
                                                            // @ts-nocheck
                                                            return {
                                                                text: `${label}: ${(value as number).toFixed(2)}%`,
                                                                fillStyle: data.datasets[0].backgroundColor[i] as LegendItem['fillStyle'],
                                                                strokeStyle: data.datasets[0].borderColor[i] as LegendItem['strokeStyle'],
                                                                lineWidth: data.datasets[0].borderWidth as LegendItem['lineWidth'],
                                                                hidden: isNaN(data.datasets[0].data[i]) || data.datasets[0].data[i] === null,
                                                                index: i
                                                            } as LegendItem;
                                                        });
                                                    }
                                                    return [];
                                                }
                                            },
                                        },
                                        title: {
                                            display: true,
                                            text: 'Holder Distribution'
                                        }
                                    },
                                    scales: {
                                        x: {
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Holders'
                                            }
                                        },
                                        y: {
                                            type: 'logarithmic',
                                            beginAtZero: true,
                                            title: {
                                                display: true,
                                                text: 'Percentage of Max Supply'
                                            }
                                        }
                                    }
                                }}
                            />
                        )}
                    </div>
                </Tab>

                {!isMobile && (
                    <Tab eventKey="mintActivity" title="Mint Activity">
                        <div className="chart-container">
                            <Line
                                data={{
                                    labels: mintActivity.map(item => item?.date as ChartDatasetProperties<string, unknown>),
                                    datasets: [{
                                        label: 'Daily Mints',
                                        data: mintActivity.map(item => item?.count as ChartDatasetProperties<string, unknown>),
                                        borderColor: 'rgb(40, 167, 69)', // Green color
                                        backgroundColor: 'rgba(40, 167, 69, 0.5)',
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            position: 'top',
                                        },
                                        title: {
                                            display: true,
                                            text: 'Daily Mint Activity'
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true
                                        }
                                    }
                                }}
                            />
                        </div>
                    </Tab>
                )}
            </Tabs>
        </div>
    );
};


export default TokenDetail;