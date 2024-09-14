import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, InputGroup, Button, Table, Tabs, Tab, Alert, Card, Spinner } from 'react-bootstrap';
import { FaSearch, FaCopy } from 'react-icons/fa';
import axios from 'axios';
import '../styles/WalletLookup.css';
import { censorTicker } from '../utils/censorTicker';
import SEO from './SEO';
import JsonLd from './JsonLd';

// Helper function for number formatting
const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
  }).format(parseFloat(number.toFixed(5)));
};

const shortenString = (str, startLength = 5, endLength = 5) => {
  if (str.length <= startLength + endLength) return str;
  return `${str.slice(0, startLength)}...${str.slice(-endLength)}`;
};

const WalletLookup = () => {
  const [address, setAddress] = useState('');
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { walletAddress } = useParams();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [utxos, setUtxos] = useState([]);
  const [transactionPage, setTransactionPage] = useState(0);
  const [utxoPage, setUtxoPage] = useState(0);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [hasMoreUtxos, setHasMoreUtxos] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingUtxos, setLoadingUtxos] = useState(false);

  const transactionObserver = useRef();
  const utxoObserver = useRef();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchWalletData = useCallback(async (addr) => {
    setLoading(true);
    setError(null);
    try {
      const [krc20Response, balanceResponse, transactionCountResponse] = await Promise.all([
        axios.get(`https://api.kasplex.org/v1/krc20/address/${addr}/tokenlist`),
        axios.get(`https://api.kaspa.org/addresses/${addr}/balance`),
        axios.get(`https://api.kaspa.org/addresses/${addr}/transactions-count`)
      ]);

      const krc20Balances = krc20Response.data.result.map(token => ({
        ...token,
        balance: token.balance / Math.pow(10, token.dec),
      }));

      setWalletData({
        address: addr,
        krc20Balances,
        kaspaBalance: balanceResponse.data.balance,
        transactionCount: transactionCountResponse.data.total,
      });

      // Reset pagination
      setTransactionPage(0);
      setUtxoPage(0);
      setTransactions([]);
      setUtxos([]);
      setHasMoreTransactions(true);
      setHasMoreUtxos(true);

      // Fetch initial transactions and UTXOs
      await fetchTransactions(addr, 0);
      await fetchUtxos(addr, 0);
    } catch (err) {
      setError('Failed to fetch wallet data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTransactions = async (addr, page) => {
    setLoadingTransactions(true);
    try {
      const response = await axios.get(`https://api.kaspa.org/addresses/${addr}/full-transactions?limit=20&offset=${page * 20}&resolve_previous_outpoints=light`);
      setTransactions(prev => [...prev, ...response.data]);
      setHasMoreTransactions(response.data.length === 20);
      setTransactionPage(page);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const fetchUtxos = async (addr, page) => {
    setLoadingUtxos(true);
    try {
      const response = await axios.get(`https://api.kaspa.org/addresses/${addr}/utxos?limit=20&offset=${page * 20}`);
      const newUtxos = response.data;
      
      setUtxos(prevUtxos => {
        // Create a Set of unique identifiers for existing UTXOs
        const existingUtxoSet = new Set(
          prevUtxos.map(utxo => `${utxo.outpoint.transactionId}-${utxo.outpoint.index}`)
        );

        // Filter out duplicates from the new UTXOs
        const uniqueNewUtxos = newUtxos.filter(
          utxo => !existingUtxoSet.has(`${utxo.outpoint.transactionId}-${utxo.outpoint.index}`)
        );

        return [...prevUtxos, ...uniqueNewUtxos];
      });

      setHasMoreUtxos(newUtxos.length === 20);
      setUtxoPage(page);
    } catch (err) {
      console.error('Failed to fetch UTXOs:', err);
    } finally {
      setLoadingUtxos(false);
    }
  };

  const lastTransactionElementRef = useCallback(node => {
    if (loadingTransactions) return;
    if (transactionObserver.current) transactionObserver.current.disconnect();
    transactionObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreTransactions) {
        fetchTransactions(walletData.address, transactionPage + 1);
      }
    });
    if (node) transactionObserver.current.observe(node);
  }, [loadingTransactions, hasMoreTransactions, walletData, transactionPage]);

  const lastUtxoElementRef = useCallback(node => {
    if (loadingUtxos) return;
    if (utxoObserver.current) utxoObserver.current.disconnect();
    utxoObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreUtxos) {
        fetchUtxos(walletData.address, utxoPage + 1);
      }
    });
    if (node) utxoObserver.current.observe(node);
  }, [loadingUtxos, hasMoreUtxos, walletData, utxoPage]);

  useEffect(() => {
    if (walletAddress) {
      setAddress(walletAddress);
      fetchWalletData(walletAddress);
    }
  }, [walletAddress, fetchWalletData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address) {
      navigate(`/wallet/${address}`);
    }
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const openExplorer = (transactionId) => {
    window.open(`https://explorer.kaspa.org/txs/${transactionId}`, '_blank', 'noopener,noreferrer');
  };

  const MobileTransactionTable = ({ transactions, openExplorer, formatNumber, shortenString }) => (
    <div className="mobile-table">
      {transactions.map((tx, index) => (
        <Card key={tx.transaction_id} className="mb-3">
          <Card.Body>
            <div className="mobile-table-row" onClick={() => openExplorer(tx.transaction_id)}>
              <div className="mobile-table-cell">
                <strong>Transaction ID:</strong> {shortenString(tx.transaction_id)}
              </div>
              <div className="mobile-table-cell">
                <strong>Amount (KAS):</strong> {formatNumber(tx.outputs.reduce((sum, output) => sum + parseInt(output.amount), 0) / 1e8)}
              </div>
              <div className="mobile-table-cell">
                <strong>Block Time:</strong> {new Date(tx.block_time).toLocaleString()}
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );

  const MobileUTXOTable = ({ utxos, openExplorer, formatNumber, shortenString }) => (
    <div className="mobile-table">
      {utxos.map((utxo, index) => (
        <Card key={`${utxo.outpoint.transactionId}-${utxo.outpoint.index}`} className="mb-3">
          <Card.Body>
            <div className="mobile-table-row" onClick={() => openExplorer(utxo.outpoint.transactionId)}>
              <div className="mobile-table-cell">
                <strong>Transaction ID:</strong> {shortenString(utxo.outpoint.transactionId)}
              </div>
              <div className="mobile-table-cell">
                <strong>Index:</strong> {utxo.outpoint.index}
              </div>
              <div className="mobile-table-cell">
                <strong>Amount (KAS):</strong> {formatNumber(parseInt(utxo.utxoEntry.amount) / 1e8)}
              </div>
              <div className="mobile-table-cell">
                <strong>Block DAA Score:</strong> {utxo.utxoEntry.blockDaaScore}
              </div>
              <div className="mobile-table-cell">
                <strong>Miner Reward:</strong> {utxo.utxoEntry.isCoinbase ? 'Yes' : 'No'}
              </div>
              <div className="mobile-table-cell">
                <strong>Status:</strong> Unspent
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );

  return (
    <Container className="wallet-lookup">
      <SEO 
        title="Wallet Lookup"
        description="Look up KRC-20 token balances and transaction history for any wallet address on the Kaspa blockchain."
        keywords="KRC-20, Kaspa, wallet lookup, token balances, transaction history"
      />
      <JsonLd 
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "KatScan Wallet Lookup",
          "description": "Look up KRC-20 token balances and transaction history for any wallet address on the Kaspa blockchain.",
          "url": "https://katscan.xyz/wallet"
        }}
      />
      <h1>Wallet Lookup</h1>
      <Form onSubmit={handleSubmit}>
        <InputGroup className="mb-3">
          <Form.Control
            type="text"
            placeholder="Enter wallet address"
            value={address}
            onChange={handleAddressChange}
          />
          <Button variant="primary" type="submit">
            <FaSearch /> Search
          </Button>
        </InputGroup>
      </Form>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      {walletData && (
        <div className="wallet-details">
          <div className="wallet-overview">
            <Card>
              <Card.Body>
                <Card.Title>Wallet Overview</Card.Title>
                <Card.Text>
                  <strong>Address:</strong> {walletData.address}{' '}
                  <FaCopy className="clickable" onClick={() => copyToClipboard(walletData.address)} />
                  <br />
                  <strong>Kaspa Balance:</strong> {formatNumber(walletData.kaspaBalance / 1e8)} KAS
                  <br />
                  <strong>Transaction Count:</strong> {walletData.transactionCount}
                </Card.Text>
              </Card.Body>
            </Card>
          </div>

          <Tabs defaultActiveKey="krc20" className="mb-3">
            <Tab eventKey="krc20" title="KRC20 Tokens">
              <div className="table-wrapper">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletData.krc20Balances.map((token) => (
                      <tr key={token.contract}>
                        <td>{censorTicker(token.tick)}</td>
                        <td>{formatNumber(token.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>
            
            <Tab eventKey="transactions" title="Recent Transactions">
              <div className="table-wrapper">
                {isMobile ? (
                  <MobileTransactionTable
                    transactions={transactions}
                    openExplorer={openExplorer}
                    formatNumber={formatNumber}
                    shortenString={shortenString}
                  />
                ) : (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Amount (KAS)</th>
                        <th>Block Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, index) => (
                        <tr 
                          key={tx.transaction_id} 
                          ref={index === transactions.length - 1 ? lastTransactionElementRef : null}
                          onClick={() => openExplorer(tx.transaction_id)}
                          className="clickable-row"
                        >
                          <td>{tx.transaction_id}</td>
                          <td>{formatNumber(tx.outputs.reduce((sum, output) => sum + parseInt(output.amount), 0) / 1e8)}</td>
                          <td>{new Date(tx.block_time).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                {loadingTransactions && <div className="loading-message">Loading more transactions...</div>}
              </div>
            </Tab>
            
            <Tab eventKey="utxos" title="UTXOs">
              <div className="table-wrapper">
                {isMobile ? (
                  <MobileUTXOTable
                    utxos={utxos}
                    openExplorer={openExplorer}
                    formatNumber={formatNumber}
                    shortenString={shortenString}
                  />
                ) : (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Transaction ID</th>
                        <th>Index</th>
                        <th>Amount (KAS)</th>
                        <th>Block DAA Score</th>
                        <th>Miner Reward</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {utxos.map((utxo, index) => (
                        <tr 
                          key={`${utxo.outpoint.transactionId}-${utxo.outpoint.index}`} 
                          ref={index === utxos.length - 1 ? lastUtxoElementRef : null}
                          onClick={() => openExplorer(utxo.outpoint.transactionId)}
                          className="clickable-row"
                        >
                          <td>{utxo.outpoint.transactionId}</td>
                          <td>{utxo.outpoint.index}</td>
                          <td>{formatNumber(parseInt(utxo.utxoEntry.amount) / 1e8)}</td>
                          <td>{utxo.utxoEntry.blockDaaScore}</td>
                          <td>{utxo.utxoEntry.isCoinbase ? 'Yes' : 'No'}</td>
                          <td>Unspent</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
                {loadingUtxos && <div className="loading-message">Loading more UTXOs...</div>}
              </div>
            </Tab>
          </Tabs>
        </div>
      )}
    </Container>
  );
};

export default WalletLookup;
