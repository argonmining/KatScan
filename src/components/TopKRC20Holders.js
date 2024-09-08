import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/TopKRC20Holders.css';

const API_BASE_URL = 'https://katapi.nachowyborski.xyz/api/topHolders';

const TopKRC20Holders = () => {
  const [topHolders, setTopHolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const fetchTopHolders = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_BASE_URL);
        const holders = response.data;

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

    fetchTopHolders();
  }, []);

  const toggleRowExpansion = (address) => {
    setExpandedRows(prev => ({ ...prev, [address]: !prev[address] }));
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="top-krc20-holders-wrapper">
      <h1>Top KRC20 Token Holders</h1>
      <div className="table-container">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Address</th>
              <th>Unique Tokens</th>
              <th>Actions</th>
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
                      {expandedRows[holder.address] ? <FaChevronUp /> : <FaChevronDown />}
                    </Button>
                  </td>
                </tr>
                {expandedRows[holder.address] && (
                  <tr>
                    <td colSpan="4">
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
                              <td>{token.tick}</td>
                              <td>{token.amount.toLocaleString(undefined, { maximumFractionDigits: token.decimals })}</td>
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
    </div>
  );
};

export default TopKRC20Holders;
