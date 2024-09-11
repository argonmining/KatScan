import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Tab, Table, Alert } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { getTokenDetails, getTokenOperations } from '../services/dataService';
import '../styles/TokenDetail.css';
import axios from 'axios';
import { censorTicker } from '../utils/censorTicker';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const shortenString = (str, startLength = 5, endLength = 5) => {
  if (str.length <= startLength + endLength) return str;
  return `${str.slice(0, startLength)}...${str.slice(-endLength)}`;
};

const TokenDetail = () => {
  const { tokenId } = useParams();
  const navigate = useNavigate();
  const [tokenData, setTokenData] = useState(null);
  const [operations, setOperations] = useState([]);
  const [operationsCursor, setOperationsCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [operationsError, setOperationsError] = useState(null);
  const observer = useRef();
  const [holderDistribution, setHolderDistribution] = useState([]);
  const [mintActivity, setMintActivity] = useState([]);
  const [activeTab, setActiveTab] = useState('topHolders');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchOperations = useCallback(async () => {
    if (loadingMore || !operationsCursor) return;
    try {
      setLoadingMore(true);
      setOperationsError(null);
      const data = await getTokenOperations(tokenId, 50, operationsCursor);
      setOperations(prevOps => [...prevOps, ...data.result]);
      setOperationsCursor(data.next);
    } catch (err) {
      console.error('Failed to fetch operations:', err);
      setOperationsError('Failed to load more operations. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  }, [tokenId, operationsCursor, loadingMore]);

  const lastOperationElementRef = useCallback(node => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && operationsCursor) {
        fetchOperations();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, operationsCursor, fetchOperations]);

  const fetchMintActivity = useCallback(async (tick) => {
    try {
      const response = await axios.get(`https://katapi.nachowyborski.xyz/api/mintsovertime?tick=${tick}`);
      const data = response.data;
      return fillMissingDates(data);
    } catch (error) {
      console.error('Failed to fetch mint activity data:', error);
      return [];
    }
  }, []);

  const fillMissingDates = (data) => {
    const filledData = [];
    const startDate = new Date(data[data.length - 1].date);
    const endDate = new Date();
    const dateMap = new Map(data.map(item => [item.date, item.count]));

    // Add a date one day before the oldest record with a count of 0
    const preStartDate = new Date(startDate);
    preStartDate.setDate(preStartDate.getDate() - 1);
    filledData.push({ date: preStartDate.toISOString().split('T')[0], count: 0 });

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      filledData.push({ date: dateStr, count: dateMap.get(dateStr) || 0 });
    }

    return filledData;
  };

  const processHolderDistribution = useCallback((holders, maxSupply, decimals) => {
    if (!holders || holders.length === 0) {
      return [
        {
          label: 'Other Holders',
          percentage: 100,
        }
      ];
    }

    const groups = [
      { label: 'Top 1-10 Holders', total: 0 },
      { label: 'Top 11-20 Holders', total: 0 },
      { label: 'Top 21-30 Holders', total: 0 },
      { label: 'Top 31-40 Holders', total: 0 },
      { label: 'Top 41-50 Holders', total: 0 },
    ];

    holders.slice(0, 50).forEach((holder, index) => {
      const groupIndex = Math.floor(index / 10);
      groups[groupIndex].total += parseRawNumber(holder.amount, decimals);
    });

    const top50Total = groups.reduce((sum, group) => sum + group.total, 0);
    const otherHoldersTotal = parseRawNumber(maxSupply, decimals) - top50Total;

    return [
      ...groups.map(group => ({
        label: group.label,
        percentage: (group.total / parseRawNumber(maxSupply, decimals)) * 100,
      })),
      {
        label: 'Other Holders',
        percentage: (otherHoldersTotal / parseRawNumber(maxSupply, decimals)) * 100,
      }
    ];
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTokenDetails(tokenId);
        if (!data) {
          throw new Error('No data returned from API');
        }
        setTokenData(data);
        const opsData = await getTokenOperations(tokenId, 50);
        setOperations(opsData.result);
        setOperationsCursor(opsData.next);

        setHolderDistribution(processHolderDistribution(data.holder, data.max, data.dec));
      } catch (err) {
        console.error('Failed to fetch token details:', err);
        setError('Failed to fetch token details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tokenId, processHolderDistribution]);

  useEffect(() => {
    const fetchMintActivityData = async () => {
      if (activeTab === 'mintActivity' && mintActivity.length === 0) {
        const mintActivityData = await fetchMintActivity(tokenData.tick.toUpperCase());
        setMintActivity(mintActivityData);
      }
    };

    fetchMintActivityData();
  }, [activeTab, mintActivity.length, tokenData, fetchMintActivity]);

  const parseRawNumber = (rawNumber, decimals) => {
    return Number(rawNumber) / Math.pow(10, decimals);
  };

  const formatNumber = (rawNumber, decimals) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(rawNumber);
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString('en-US', { timeZoneName: 'short' });
  };

  const handleAddressClick = (address) => {
    navigate(`/wallet/${address}`);
  };

  const handleTransactionClick = (hashRev) => {
    navigate(`/transaction-lookup/${hashRev}`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!tokenData) return <Alert variant="warning">No data available</Alert>;

  return (
    <div className="token-detail">
      <div className="token-header">
        <h1>Token Details: {censorTicker(tokenData.tick)}</h1>
        <span className="creation-date">
          Deployed on {new Date(tokenData.mtsCreated).toLocaleDateString()}
        </span>
      </div>
      <Card className="token-info-card">
        <Card.Body>
          <div className="token-info-grid">
            <div className="token-info-item">
              <span className="token-info-label">Max Supply</span>
              <span className="token-info-value">{formatNumber(parseRawNumber(tokenData.max, tokenData.dec), tokenData.dec)}</span>
            </div>
            <div className="token-info-item">
              <span className="token-info-label">Total Minted</span>
              <span className="token-info-value">{formatNumber(parseRawNumber(tokenData.minted, tokenData.dec), tokenData.dec)}</span>
            </div>
            <div className="token-info-item">
              <span className="token-info-label">Limit per Mint</span>
              <span className="token-info-value">{formatNumber(parseRawNumber(tokenData.lim, tokenData.dec), tokenData.dec)}</span>
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
              <MobileTable
                data={tokenData.holder}
                type="holders"
                tokenData={tokenData}
                handleAddressClick={handleAddressClick}
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
                        <span
                          className="clickable-address"
                          onClick={() => handleAddressClick(holder.address)}
                        >
                          {shortenString(holder.address)}
                        </span>
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
            Note: Only top holders are displayed. The total number of holders is {formatNumber(tokenData.holderTotal, 0)}.
          </p>
        </Tab>
        <Tab eventKey="recentOperations" title="Recent Operations">
          <div className="detail-table-container">
            {isMobile ? (
              <MobileTable
                data={operations}
                type="operations"
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
                    <tr key={index} ref={index === operations.length - 1 ? lastOperationElementRef : null}>
                      <td>{op.op}</td>
                      <td>
                        <span
                          className="clickable-address"
                          onClick={() => handleTransactionClick(op.hashRev)}
                        >
                          {shortenString(op.hashRev)}
                        </span>
                      </td>
                      <td>
                        <span
                          className="clickable-address"
                          onClick={() => handleAddressClick(op.op === 'mint' ? op.to : op.from)}
                        >
                          {shortenString(op.op === 'mint' ? op.to : op.from)}
                        </span>
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
                        generateLabels: (chart) => {
                          const data = chart.data;
                          if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                              const value = data.datasets[0].data[i];
                              return {
                                text: `${label}: ${value.toFixed(2)}%`,
                                fillStyle: data.datasets[0].backgroundColor[i],
                                strokeStyle: data.datasets[0].borderColor[i],
                                lineWidth: data.datasets[0].borderWidth,
                                hidden: isNaN(data.datasets[0].data[i]) || data.datasets[0].data[i] === null,
                                index: i
                              };
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
                  labels: mintActivity.map(item => item.date),
                  datasets: [{
                    label: 'Daily Mints',
                    data: mintActivity.map(item => item.count),
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

const MobileTable = ({ data, type, tokenData, handleAddressClick, handleTransactionClick, formatNumber, parseRawNumber, formatDateTime, shortenString }) => (
  <div className="mobile-table">
    {data.map((item, index) => (
      <div key={index} className="mobile-table-row">
        {type === 'holders' && (
          <>
            <div className="mobile-table-cell">
              <strong>Rank:</strong> {index + 1}
            </div>
            <div className="mobile-table-cell">
              <strong>Address:</strong>
              <span
                className="clickable-address"
                onClick={() => handleAddressClick(item.address)}
              >
                {shortenString(item.address)}
              </span>
            </div>
            <div className="mobile-table-cell">
              <strong>Amount:</strong> {formatNumber(parseRawNumber(item.amount, tokenData.dec), tokenData.dec)}
            </div>
            <div className="mobile-table-cell">
              <strong>% of Total Supply:</strong>
              {((parseRawNumber(item.amount, tokenData.dec) / parseRawNumber(tokenData.max, tokenData.dec)) * 100).toFixed(2)}%
            </div>
          </>
        )}
        {type === 'operations' && (
          <>
            <div className="mobile-table-cell">
              <strong>Type:</strong> {item.op}
            </div>
            <div className="mobile-table-cell">
              <strong>Transaction ID:</strong>
              <span
                className="clickable-address"
                onClick={() => handleTransactionClick(item.hashRev)}
              >
                {shortenString(item.hashRev)}
              </span>
            </div>
            <div className="mobile-table-cell">
              <strong>Address:</strong>
              <span
                className="clickable-address"
                onClick={() => handleAddressClick(item.op === 'mint' ? item.to : item.from)}
              >
                {shortenString(item.op === 'mint' ? item.to : item.from)}
              </span>
            </div>
            <div className="mobile-table-cell">
              <strong>Amount:</strong> {formatNumber(parseRawNumber(item.amt, tokenData.dec), tokenData.dec)}
            </div>
            <div className="mobile-table-cell">
              <strong>Timestamp:</strong> {formatDateTime(item.mtsAdd)}
            </div>
          </>
        )}
      </div>
    ))}
  </div>
);

export default TokenDetail;