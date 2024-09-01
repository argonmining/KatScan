import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Tabs, Tab, Table } from 'react-bootstrap';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getTokenDetails } from '../services/dataService';
import '../styles/TokenDetail.css';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Title, Tooltip, Legend);

const TokenDetail = () => {
  const { tokenId } = useParams();
  const [tokenData, setTokenData] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'holdings', direction: 'descending' });
  const [transactionFilterText, setTransactionFilterText] = useState('');
  const [transactionSortConfig, setTransactionSortConfig] = useState({ key: 'date', direction: 'descending' });

  useEffect(() => {
    const fetchData = async () => {
      const data = await getTokenDetails(tokenId);
      setTokenData(data);
    };
    fetchData();
  }, [tokenId]);

  if (!tokenData) {
    return <p>Loading...</p>;
  }

  const priceHistoryData = tokenData.priceHistory || { labels: [], data: [] };
  const holderDistributionData = tokenData.holderDistribution || { labels: [], data: [] };
  const crossTokenHoldersData = tokenData.crossTokenHolders || { labels: [], data: [] };
  const holderChangesOverTimeData = tokenData.holderChangesOverTime || { labels: [], datasets: [] };

  const chartData = {
    labels: priceHistoryData.labels,
    datasets: [
      {
        label: `${tokenData.name} Price History`,
        data: priceHistoryData.data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const holderDistributionChartData = {
    labels: holderDistributionData.labels,
    datasets: [
      {
        label: 'Holder Distribution',
        data: holderDistributionData.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(75, 192, 192, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const crossTokenHoldersChartData = {
    labels: crossTokenHoldersData.labels,
    datasets: [
      {
        label: 'Number of Holders',
        data: crossTokenHoldersData.data,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const holderSegmentationData = {
    labels: ['Lions (Large Holders)', 'Tigers (Medium Holders)', 'Kittens (Small Holders)'],
    datasets: [
      {
        label: 'Holder Segmentation',
        data: [60, 25, 15],
        backgroundColor: [
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const holderChangesOverTimeChartData = {
    labels: holderChangesOverTimeData.labels,
    datasets: holderChangesOverTimeData.datasets.map((dataset, index) => ({
      label: `Holder ${index + 1}`,
      data: dataset.data,
      borderColor: dataset.color,
      fill: false,
    })),
  };

  // Filtering and Sorting Logic for Top Holders
  const filteredHolders = tokenData.topHolders
    .filter((holder) => holder.address.includes(filterText))
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filtering and Sorting Logic for Recent Transactions
  const filteredTransactions = tokenData.transactions
    .filter((transaction) => transaction.id.toString().includes(transactionFilterText))
    .sort((a, b) => {
      if (a[transactionSortConfig.key] < b[transactionSortConfig.key]) {
        return transactionSortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[transactionSortConfig.key] > b[transactionSortConfig.key]) {
        return transactionSortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

  const requestTransactionSort = (key) => {
    let direction = 'ascending';
    if (transactionSortConfig.key === key && transactionSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setTransactionSortConfig({ key, direction });
  };

  return (
    <div className="token-detail">
      <h2>{tokenData.name}</h2>
      <p>Total Supply: {tokenData.supply}</p>
      <p>Number of Holders: {tokenData.holders}</p>

      <Tabs defaultActiveKey="priceHistory" id="uncontrolled-tab-example" className="mb-3">
        <Tab eventKey="priceHistory" title="Price History">
          <Card className="chart-card">
            <Card.Body>
              <Card.Title>Price History</Card.Title>
              <Line data={chartData} />
              <Card.Text>
                This chart shows the historical price trends of {tokenData.name}, helping users track market movements over time.
              </Card.Text>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="holderDistribution" title="Holder Distribution">
          <Card className="chart-card">
            <Card.Body>
              <Card.Title>Holder Distribution</Card.Title>
              <Pie data={holderDistributionChartData} />
              <Card.Text>
                This chart visualizes how {tokenData.name} is distributed among different holders, indicating the concentration of token ownership.
              </Card.Text>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="crossTokenHolders" title="Cross-Token Holders">
          <Card className="chart-card">
            <Card.Body>
              <Card.Title>Cross-Token Holders</Card.Title>
              <Bar data={crossTokenHoldersChartData} />
              <Card.Text>
                Explore the overlap of {tokenData.name} holders with other tokens, providing insights into their investment diversification.
              </Card.Text>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="holderSegmentation" title="Holder Segmentation">
          <Card className="chart-card">
            <Card.Body>
              <Card.Title>Holder Segmentation</Card.Title>
              <Pie data={holderSegmentationData} />
              <Card.Text>
                This chart categorizes holders into 'Lions,' 'Tigers,' and 'Kittens' based on the size of their holdings, showing the distribution among different holder types.
              </Card.Text>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="holderChangesOverTime" title="Holder Changes Over Time">
          <Card className="chart-card">
            <Card.Body>
              <Card.Title>Holder Changes Over Time</Card.Title>
              <Line data={holderChangesOverTimeChartData} />
              <Card.Text>
                Monitor how the holdings of major {tokenData.name} holders have changed over time, providing insights into buying and selling behaviors.
              </Card.Text>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="holders" title="Top Holders">
          <input
            type="text"
            placeholder="Filter by address"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <Table striped bordered hover>
            <thead>
              <tr>
                <th onClick={() => requestSort('rank')}>Rank</th>
                <th onClick={() => requestSort('address')}>Holder Address</th>
                <th onClick={() => requestSort('holdings')}>Holdings</th>
                <th onClick={() => requestSort('percentage')}>Percentage of Total Supply</th>
              </tr>
            </thead>
            <tbody>
              {filteredHolders.map((holder, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{holder.address}</td>
                  <td>{holder.holdings}</td>
                  <td>{((holder.holdings / tokenData.supply) * 100).toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>

        <Tab eventKey="transactions" title="Recent Transactions">
          <input
            type="text"
            placeholder="Filter by transaction ID"
            value={transactionFilterText}
            onChange={(e) => setTransactionFilterText(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <Table striped bordered hover>
            <thead>
              <tr>
                <th onClick={() => requestTransactionSort('id')}>Transaction ID</th>
                <th onClick={() => requestTransactionSort('amount')}>Amount</th>
                <th onClick={() => requestTransactionSort('date')}>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    </div>
  );
};

export default TokenDetail;
