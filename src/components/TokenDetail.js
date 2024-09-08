import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Tab, Table, Alert } from 'react-bootstrap';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { getTokenDetails, getTokenOperations } from '../services/dataService';
import '../styles/TokenDetail.css';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

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
  const [transferVolume, setTransferVolume] = useState([]);
  const [holderDistribution, setHolderDistribution] = useState([]);
  const [mintActivity, setMintActivity] = useState([]);

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
    const startDate = new Date(data[0].date);
    const endDate = new Date();
    const dateMap = new Map(data.map(item => [item.date, item.count]));

    for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      filledData.push({ date: dateStr, count: dateMap.get(dateStr) || 0 });
    }

    return filledData;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTokenDetails(tokenId);
        setTokenData(data);
        const opsData = await getTokenOperations(tokenId, 50);
        setOperations(opsData.result);
        setOperationsCursor(opsData.next);

        setTransferVolume(generateMockTransferVolume());
        setHolderDistribution(generateMockHolderDistribution());
        const mintActivityData = await fetchMintActivity(data.tick.toUpperCase());
        setMintActivity(mintActivityData);
      } catch (err) {
        setError('Failed to fetch token details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tokenId, fetchMintActivity]);

  // Helper functions to generate mock data
  const generateMockTransferVolume = () => {
    const dates = Array.from({length: 30}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    });
    const volumes = Array.from({length: 30}, () => Math.floor(Math.random() * 1000000));
    return dates.map((date, index) => ({ date, volume: volumes[index] }));
  };

  const generateMockHolderDistribution = () => {
    return [
      { range: '0-100', count: Math.floor(Math.random() * 1000) },
      { range: '101-1000', count: Math.floor(Math.random() * 500) },
      { range: '1001-10000', count: Math.floor(Math.random() * 100) },
      { range: '10001+', count: Math.floor(Math.random() * 10) },
    ];
  };

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
        <h1>{tokenData.tick} Token Details</h1>
        <span className="creation-date">Deployed on {formatDateTime(tokenData.mtsAdd)}</span>
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

      <Tabs defaultActiveKey="topHolders" className="mb-3">
        <Tab eventKey="topHolders" title="Top Holders">
          <div className="detail-table-container">
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
                        {holder.address}
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
          </div>
          <p className="mt-3 text-muted">
            Note: Only top holders are displayed. The total number of holders is {formatNumber(tokenData.holderTotal, 0)}.
          </p>
        </Tab>
        <Tab eventKey="recentOperations" title="Recent Operations">
          <div className="detail-table-container">
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
                        {op.hashRev}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="clickable-address" 
                        onClick={() => handleAddressClick(op.op === 'mint' ? op.to : op.from)}
                      >
                        {op.op === 'mint' ? op.to : op.from}
                      </span>
                    </td>
                    <td>{formatNumber(parseRawNumber(op.amt, tokenData.dec), tokenData.dec)}</td>
                    <td>{formatDateTime(op.mtsAdd)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {loadingMore && <div>Loading more operations...</div>}
          {operationsError && <Alert variant="danger">{operationsError}</Alert>}
          {!operationsCursor && !loadingMore && <div>No more operations to load.</div>}
        </Tab>

        <Tab eventKey="transferVolume" title="Transfer Volume">
          <div className="chart-container">
            <Bar
              data={{
                labels: transferVolume.map(item => item.date),
                datasets: [{
                  label: 'Transfer Volume',
                  data: transferVolume.map(item => item.volume),
                  backgroundColor: 'rgba(53, 162, 235, 0.5)',
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Daily Transfer Volume'
                  }
                }
              }}
            />
          </div>
        </Tab>

        <Tab eventKey="holderDistribution" title="Holder Distribution">
          <div className="chart-container">
            <Pie
              data={{
                labels: holderDistribution.map(item => item.range),
                datasets: [{
                  label: 'Number of Holders',
                  data: holderDistribution.map(item => item.count),
                  backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                  ],
                  borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                  ],
                  borderWidth: 1,
                }]
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Holder Distribution'
                  }
                }
              }}
            />
          </div>
        </Tab>

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
      </Tabs>
    </div>
  );
};

export default TokenDetail;