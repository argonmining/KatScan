import React, { useState, useEffect } from 'react';
import { Form, Tab, Tabs, Card, Table } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { getTokenDetails } from '../services/dataService';

const TokenComparison = () => {
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [tokenData, setTokenData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'supply', direction: 'ascending' });

  useEffect(() => {
    const fetchData = async () => {
      const dataPromises = selectedTokens.map((tokenId) => getTokenDetails(tokenId));
      const data = await Promise.all(dataPromises);
      setTokenData(data);
    };

    if (selectedTokens.length) {
      fetchData();
    }
  }, [selectedTokens]);

  const handleTokenSelect = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedTokens((prev) => [...prev, value]);
    } else {
      setSelectedTokens((prev) => prev.filter((tokenId) => tokenId !== value));
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedTokenData = [...tokenData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const generateBarChartData = (metric) => {
    return {
      labels: sortedTokenData.map((token) => token.name),
      datasets: [
        {
          label: metric,
          data: sortedTokenData.map((token) => token[metric] || 0), // Add fallback for undefined values
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="token-comparison">
      <h2>Compare KRC20 Tokens</h2>
      <Form>
        <Form.Group>
          <Form.Label>Select Tokens to Compare</Form.Label>
          <div className="token-select">
            {/* Example token checkboxes, replace with actual data */}
            <Form.Check
              type="checkbox"
              label="Token 1"
              value="1"
              onChange={handleTokenSelect}
            />
            <Form.Check
              type="checkbox"
              label="Token 2"
              value="2"
              onChange={handleTokenSelect}
            />
            {/* Add more tokens as needed */}
          </div>
        </Form.Group>
      </Form>

      {sortedTokenData.length > 0 && (
        <Tabs defaultActiveKey="overview" className="mb-3">
          <Tab eventKey="overview" title="Overview">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Metric</th>
                  {sortedTokenData.map((token) => (
                    <th key={token.name}>{token.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Supply</td>
                  {sortedTokenData.map((token) => (
                    <td key={token.name}>{token.supply}</td>
                  ))}
                </tr>
                <tr>
                  <td>Number of Holders</td>
                  {sortedTokenData.map((token) => (
                    <td key={token.name}>{token.holders}</td>
                  ))}
                </tr>
                <tr>
                  <td>Transaction Volume</td>
                  {sortedTokenData.map((token) => (
                    <td key={token.name}>{token.transactions ? token.transactions.length : 0}</td> // Add check for transactions
                  ))}
                </tr>
                <tr>
                  <td>Recent Operations</td>
                  {sortedTokenData.map((token) => (
                    <td key={token.name}>{token.operations ? token.operations.length : 'N/A'}</td> // Add check for operations
                  ))}
                </tr>
              </tbody>
            </Table>
          </Tab>

          <Tab eventKey="charts" title="Charts">
            <div className="chart-section">
              <Card>
                <Card.Body>
                  <Card.Title onClick={() => requestSort('supply')}>Total Supply</Card.Title>
                  <Bar data={generateBarChartData('supply')} />
                </Card.Body>
              </Card>

              <Card>
                <Card.Body>
                  <Card.Title onClick={() => requestSort('holders')}>Number of Holders</Card.Title>
                  <Bar data={generateBarChartData('holders')} />
                </Card.Body>
              </Card>

              <Card>
                <Card.Body>
                  <Card.Title onClick={() => requestSort('transactions.length')}>Transaction Volume</Card.Title>
                  <Bar data={generateBarChartData('transactions.length')} />
                </Card.Body>
              </Card>

              <Card>
                <Card.Body>
                  <Card.Title onClick={() => requestSort('operations.length')}>Recent Operations</Card.Title>
                  <Bar data={generateBarChartData('operations.length')} />
                </Card.Body>
              </Card>
            </div>
          </Tab>
        </Tabs>
      )}
    </div>
  );
};

export default TokenComparison;
