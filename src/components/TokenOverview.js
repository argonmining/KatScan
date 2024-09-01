import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Table, ProgressBar, Badge, Pagination } from 'react-bootstrap';
import { getKRC20TokenList } from '../services/dataService';
import '../styles/TokenOverview.css';

const TokenOverview = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [tokensPerPage, setTokensPerPage] = useState(10);
  const [totalTokens, setTotalTokens] = useState(0);
  const tableRef = useRef(null);

  useEffect(() => {
    const calculateTokensPerPage = () => {
      if (tableRef.current) {
        const tableHeight = window.innerHeight - tableRef.current.offsetTop - 100; // Adjust for pagination
        const rowHeight = 53; // Approximate height of a table row
        const calculatedTokensPerPage = Math.floor(tableHeight / rowHeight);
        setTokensPerPage(Math.max(calculatedTokensPerPage, 1));
      }
    };

    calculateTokensPerPage();
    window.addEventListener('resize', calculateTokensPerPage);

    return () => window.removeEventListener('resize', calculateTokensPerPage);
  }, []);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const data = await getKRC20TokenList(currentPage, tokensPerPage, sortField, sortDirection);
        setTokens(data.result || []);
        setTotalTokens(data.total || 0);
      } catch (err) {
        console.error('Error in TokenOverview:', err);
        setError(`Failed to fetch tokens: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [currentPage, tokensPerPage, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatNumber = (value, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  const calculateValue = (value, decimals) => {
    return parseFloat(value) / Math.pow(10, parseInt(decimals));
  };

  const calculatePercentage = (part, whole) => {
    return (part / whole) * 100;
  };

  const formatState = (state) => {
    return state === 'finished' ? 'Fully Minted' : 'Minting';
  };

  const getProgressBarVariant = (percentage) => {
    if (percentage < 33) return 'success';
    if (percentage < 66) return 'warning';
    return 'danger';
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp)).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="token-overview">
      <h2>Token Overview</h2>
      <div className="table-container" ref={tableRef}>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th className="sortable-header" onClick={() => handleSort('tick')}>
                Tick <span className="sort-indicator">{sortField === 'tick' && (sortDirection === 'asc' ? '▲' : '▼')}</span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('maxSupply')}>
                Max Supply <span className="sort-indicator">{sortField === 'maxSupply' && (sortDirection === 'asc' ? '▲' : '▼')}</span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('minted')}>
                Minted <span className="sort-indicator">{sortField === 'minted' && (sortDirection === 'asc' ? '▲' : '▼')}</span>
              </th>
              <th className="sortable-header" onClick={() => handleSort('preAllocation')}>
                Pre-allocation <span className="sort-indicator">{sortField === 'preAllocation' && (sortDirection === 'asc' ? '▲' : '▼')}</span>
              </th>
              <th>Minting Progress</th>
              <th>Launch Type</th>
              <th className="sortable-header" onClick={() => handleSort('deployedDate')}>
                Deployed Date <span className="sort-indicator">{sortField === 'deployedDate' && (sortDirection === 'asc' ? '▲' : '▼')}</span>
              </th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => {
              const maxSupply = calculateValue(token.max, token.dec);
              const mintedAmount = calculateValue(token.minted, token.dec);
              const preAllocation = calculateValue(token.pre, token.dec);
              const mintedPercentage = calculatePercentage(mintedAmount, maxSupply);
              const isFairLaunch = preAllocation === 0;
              return (
                <tr key={token.tick}>
                  <td>
                    <Link to={`/tokens/${token.tick}`}>{token.tick}</Link>
                  </td>
                  <td>{formatNumber(maxSupply)}</td>
                  <td>
                    {formatNumber(mintedAmount)} 
                    <span className="text-muted"> ({formatNumber(mintedPercentage, 1)}%)</span>
                  </td>
                  <td>{formatNumber(preAllocation)}</td>
                  <td>
                    <ProgressBar 
                      now={mintedPercentage} 
                      label={`${formatNumber(mintedPercentage, 1)}%`}
                      variant={getProgressBarVariant(mintedPercentage)}
                    />
                  </td>
                  <td>
                    <Badge bg={isFairLaunch ? 'success' : 'warning'}>
                      {isFairLaunch ? 'Fair Launch' : 'Has Pre-Mint'}
                    </Badge>
                  </td>
                  <td>{formatDate(token.mtsAdd)}</td>
                  <td>{formatState(token.state)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      {totalTokens > tokensPerPage && (
        <Pagination className="justify-content-center mt-3">
          <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
          {[...Array(Math.min(5, Math.ceil(totalTokens / tokensPerPage))).keys()].map((number) => (
            <Pagination.Item 
              key={number + 1} 
              active={number + 1 === currentPage} 
              onClick={() => paginate(number + 1)}
            >
              {number + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === Math.ceil(totalTokens / tokensPerPage)} 
          />
          <Pagination.Last 
            onClick={() => paginate(Math.ceil(totalTokens / tokensPerPage))} 
            disabled={currentPage === Math.ceil(totalTokens / tokensPerPage)} 
          />
        </Pagination>
      )}
    </div>
  );
};

export default TokenOverview;
