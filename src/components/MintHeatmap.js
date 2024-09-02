import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';
import { Container, Row, Col, Form, Spinner, ProgressBar } from 'react-bootstrap';
import { getKRC20TokenList, getMintOperations } from '../services/dataService';
import '../styles/MintHeatmap.css';

const COLORS = ['#63b598', '#ce7d78', '#ea9e70', '#a48a9e', '#c6e1e8', '#648177', '#0d5ac1', '#f205e6', '#1c0365', '#14a9ad', '#4ca2f9', '#a4e43f', '#d298e2', '#6119d0', '#d2737d', '#c0a43c', '#f2510e', '#651be6', '#79806e', '#61da5e'];
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const timeframes = [
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
];

const MintHeatmap = () => {
  const [tokens, setTokens] = useState([]);
  const [allMintData, setAllMintData] = useState({});
  const [mintData, setMintData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [timeframe, setTimeframe] = useState('week');

  const fetchTokens = async () => {
    try {
      const data = await getKRC20TokenList(10000);
      setTokens(data.result);
    } catch (error) {
      console.error('Error fetching tokens:', error);
    }
  };

  const getCachedData = (key) => {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRATION) {
        return data;
      }
    }
    return null;
  };

  const setCachedData = (key, data) => {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  };

  const fetchMintData = useCallback(async () => {
    setLoading(true);
    setProgress(0);
    setProgressMessage('Preparing to fetch data...');
    const mintCounts = {};

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      setProgressMessage(`Fetching data for ${token.tick} (${i + 1}/${tokens.length})`);
      
      let cachedTokenData = getCachedData(`mintData_${token.tick}`);
      let lastMintTimestamp = cachedTokenData ? Math.max(...cachedTokenData.map(op => op.timestamp)) : 0;

      try {
        let allOperations = cachedTokenData || [];
        let cursor = null;
        let operationsFetched = 0;
        do {
          const operations = await getMintOperations(token.tick, 50, cursor);
          if (operations && operations.result && Array.isArray(operations.result)) {
            const newOperations = operations.result.filter(op => parseInt(op.mtsAdd) > lastMintTimestamp);
            allOperations = [...allOperations, ...newOperations.map(op => ({
              timestamp: parseInt(op.mtsAdd),
              op: op.op
            }))];
            cursor = operations.next;
            operationsFetched += newOperations.length;
            setProgressMessage(`Fetched ${operationsFetched} new operations for ${token.tick}`);
            
            if (newOperations.length === 0) break; // No more new operations
          } else {
            break;
          }
        } while (cursor && allOperations.length < 10000);

        mintCounts[token.tick] = allOperations;
        setCachedData(`mintData_${token.tick}`, allOperations);
      } catch (error) {
        console.error(`Error fetching mint data for ${token.tick}:`, error);
      }
      setProgress(Math.round(((i + 1) / tokens.length) * 100));
    }

    setAllMintData(mintCounts);
    setLoading(false);
    setProgressMessage('');
  }, [tokens]);

  const getStartDate = (timeframe) => {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        return new Date(now.setHours(0, 0, 0, 0));
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setDate(now.getDate() - 7));
    }
  };

  const filteredMintData = useMemo(() => {
    const startDate = getStartDate(timeframe);
    const filteredCounts = Object.entries(allMintData).reduce((acc, [tick, operations]) => {
      const filteredOps = operations.filter(op => 
        op.op === 'mint' && new Date(op.timestamp) >= startDate
      );
      acc[tick] = filteredOps.length;
      return acc;
    }, {});

    return Object.entries(filteredCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 50)
      .map(([name, value]) => ({ name, value }));
  }, [allMintData, timeframe]);

  useEffect(() => {
    fetchTokens();
  }, []);

  useEffect(() => {
    if (tokens.length > 0) {
      fetchMintData();
    }
  }, [tokens, fetchMintData]);

  useEffect(() => {
    setMintData(filteredMintData);
  }, [filteredMintData]);

  const CustomizedContent = ({ x, y, width, height, name, value, index }) => {
    const fontSize = Math.min(width / 6, height / 4, 16);
    const shortName = name ? (name.length > 10 ? `${name.slice(0, 9)}...` : name) : '';
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: COLORS[index % COLORS.length],
            stroke: '#fff',
            strokeWidth: 2,
            strokeOpacity: 1,
          }}
        />
        {width > 50 && height > 50 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - fontSize / 2}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={fontSize}
              fontWeight="bold"
              style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.5)', strokeWidth: 2 }}
            >
              {shortName}
            </text>
            {value !== undefined && (
              <text
                x={x + width / 2}
                y={y + height / 2 + fontSize / 2}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={fontSize * 0.8}
                style={{ paintOrder: 'stroke', stroke: 'rgba(0,0,0,0.5)', strokeWidth: 2 }}
              >
                {value.toLocaleString()}
              </text>
            )}
          </>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p style={{ margin: 0 }}><strong>{data.name}</strong></p>
          <p style={{ margin: 0 }}>Mints: {data.value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Container className="mint-heatmap">
      <h1 className="mb-4">Token Mint Heatmap</h1>
      <Row className="mb-4">
        <Col md={4}>
          <Form.Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            disabled={loading}
          >
            {timeframes.map((tf) => (
              <option key={tf.value} value={tf.value}>{tf.label}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>
      {loading ? (
        <div>
          <p>{progressMessage}</p>
          <ProgressBar now={progress} label={`${progress}%`} className="mb-3" />
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : mintData.length > 0 ? (
        <div className="heatmap-container" style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
          <ResponsiveContainer>
            <Treemap
              data={mintData}
              dataKey="value"
              stroke="#fff"
              fill="#8884d8"
              content={<CustomizedContent />}
              animationDuration={0}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>
      ) : (
        <p>No mint data available for the selected timeframe. Try adjusting the timeframe or check if there are any minting operations.</p>
      )}
    </Container>
  );
};

export default MintHeatmap;
