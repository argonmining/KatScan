import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, InputGroup, Button, Table, Tabs, Tab, Alert, Card } from 'react-bootstrap';
import { FaSearch, FaExternalLinkAlt } from 'react-icons/fa';
import axios from 'axios';
import '../styles/WalletLookup.css';

const WalletLookup = () => {
  const [address, setAddress] = useState('');
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalValue, setTotalValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [transactionError, setTransactionError] = useState(null);
  const [transactionsCursor, setTransactionsCursor] = useState('');
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const observer = useRef();
  const { walletAddress } = useParams();
  const navigate = useNavigate();

  const fetchBalances = useCallback(async (addr) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`https://api.kasplex.org/v1/krc20/address/${addr}/tokenlist`);
      const balancesWithValue = response.data.result.map(token => ({
        ...token,
        value: calculateValue(token.balance, token.dec),
      }));
      setBalances(balancesWithValue);
      setTotalValue(balancesWithValue.reduce((sum, token) => sum + token.value, 0));
    } catch (err) {
      setError('Failed to fetch wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      setAddress(walletAddress);
      fetchBalances(walletAddress);
    }
  }, [walletAddress, fetchBalances]);

  const fetchTransactions = useCallback(async () => {
    if (transactionLoading || !hasMoreTransactions) return;
    try {
      setTransactionLoading(true);
      setTransactionError(null);
      const response = await axios.get(`https://api.kasplex.org/v1/krc20/oplist?address=${walletAddress}${transactionsCursor ? `&cursor=${transactionsCursor}` : ''}`);
      
      if (response.data.result && response.data.result.length > 0) {
        setTransactions(prevTransactions => [...prevTransactions, ...response.data.result]);
        setTransactionsCursor(response.data.next || '');
        setHasMoreTransactions(!!response.data.next);
      } else {
        setHasMoreTransactions(false);
      }
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setTransactionError('Failed to load more transactions. Please try again.');
    } finally {
      setTransactionLoading(false);
    }
  }, [walletAddress, transactionsCursor, transactionLoading, hasMoreTransactions]);

  const lastTransactionElementRef = useCallback(node => {
    if (transactionLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreTransactions) {
        fetchTransactions();
      }
    });
    if (node) observer.current.observe(node);
  }, [transactionLoading, hasMoreTransactions, fetchTransactions]);

  useEffect(() => {
    if (walletAddress) {
      setTransactions([]);
      setTransactionsCursor('');
      setHasMoreTransactions(true);
      fetchTransactions();
    }
  }, [walletAddress]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address) {
      navigate(`/wallet/${address}`);
    }
  };

  const calculateValue = (balance, decimals) => {
    return parseFloat(balance) / Math.pow(10, parseInt(decimals));
  };

  const formatBalance = (balance) => {
    return parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 });
  };

  const formatDate = (timestamp) => {
    return new Date(parseInt(timestamp)).toLocaleString();
  };

  const openExplorer = (hashRev) => {
    window.open(`https://explorer.kaspa.org/txs/${hashRev}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Container className="wallet-lookup">
      <h1>Wallet Lookup</h1>
      <Form onSubmit={handleSubmit} className="mb-4">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Enter wallet address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <Button type="submit" variant="primary">
            <FaSearch />
          </Button>
        </InputGroup>
      </Form>

      {walletAddress ? (
        <Tabs defaultActiveKey="overview" className="mb-3">
          <Tab eventKey="overview" title="Overview">
            <Card>
              <Card.Body>
                <Card.Title>Wallet Overview</Card.Title>
                <Card.Text>
                  <strong>Total Value:</strong> ${formatBalance(totalValue)}
                </Card.Text>
                <Card.Text>
                  <strong>Number of Tokens:</strong> {balances.length}
                </Card.Text>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="balances" title="Balances">
            {loading ? (
              <p>Loading balances...</p>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Balance</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((token) => (
                    <tr key={token.tick}>
                      <td>{token.tick}</td>
                      <td>{formatBalance(calculateValue(token.balance, token.dec))}</td>
                      <td>${formatBalance(token.value)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>

          <Tab eventKey="transactions" title="Transactions">
            <div className="transactions-container">
              {transactionError && <Alert variant="danger">{transactionError}</Alert>}
              <div className="table-container">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Explorer</th>
                      <th>Operation</th>
                      <th>Token</th>
                      <th>Amount</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, index) => (
                      <tr key={tx.opScore} ref={index === transactions.length - 1 ? lastTransactionElementRef : null}>
                        <td className="text-center">
                          <FaExternalLinkAlt 
                            onClick={() => openExplorer(tx.hashRev)} 
                            style={{ cursor: 'pointer' }}
                            title="View in Kaspa Explorer"
                          />
                        </td>
                        <td>{tx.op}</td>
                        <td>{tx.tick}</td>
                        <td>{formatBalance(calculateValue(tx.amt, 8))}</td>
                        <td>{tx.from.substring(0, 10)}...</td>
                        <td>{tx.to.substring(0, 10)}...</td>
                        <td>{formatDate(tx.mtsAdd)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              {transactionLoading && <div className="text-center mt-3">Loading more transactions...</div>}
              {!hasMoreTransactions && !transactionLoading && transactions.length > 0 && (
                <div className="text-center mt-3">No more transactions to load.</div>
              )}
            </div>
          </Tab>
        </Tabs>
      ) : (
        <p>Enter a wallet address to view its details.</p>
      )}
    </Container>
  );
};

export default WalletLookup;
