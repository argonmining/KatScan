import React, {FC, FormEvent, useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Alert, Button, Card, Container, Form, InputGroup, Tab, Table, Tabs} from 'react-bootstrap';
import {FaCopy, FaSearch} from 'react-icons/fa';
import '../styles/WalletLookup.css';
import {censorTicker} from '../utils/censorTicker';
import SEO from '../components/SEO';
import JsonLd from '../components/JsonLd';
import {LoadingSpinner} from "../components/LoadingSpinner";
import {simpleRequest} from "../services/RequestService";
import {TokenListResponse} from "../interfaces/ApiResponseTypes";
import {Utxos, WalletBalance, WalletToken, WalletTotal} from "../interfaces/WalletData";
import {Transaction} from "../interfaces/Transaction";
import {MobileTransactionTable} from "../components/tables/MobileTransactionTable";
import {MobileUTXOTable} from "../components/tables/MobileUTXOTable";

// Helper function for number formatting
const formatNumber = (number: number): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 5,
    }).format(parseFloat(number.toFixed(5)));
};

const shortenString = (str: string, startLength = 5, endLength = 5): string => {
    if (str.length <= startLength + endLength) return str;
    return `${str.slice(0, startLength)}...${str.slice(-endLength)}`;
};

type InternalWalletData = {
    address: string
    krc20Balances: WalletToken[]
    kaspaBalance: number
    transactionCount: number
}

const WalletLookup: FC = () => {
    const [address, setAddress] = useState('');
    const [walletData, setWalletData] = useState<InternalWalletData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {walletAddress} = useParams();
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [utxos, setUtxos] = useState<Utxos[]>([]);
    const [transactionPage, setTransactionPage] = useState(0);
    const [utxoPage, setUtxoPage] = useState(0);
    const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
    const [hasMoreUtxos, setHasMoreUtxos] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [loadingUtxos, setLoadingUtxos] = useState(false);

    const transactionObserver = useRef<IntersectionObserver>();
    const utxoObserver = useRef<IntersectionObserver>();

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchTransactions = async (addr: string, page: number) => {
        setLoadingTransactions(true);
        try {
            const response = await simpleRequest<Transaction[]>(`https://api.kaspa.org/addresses/${addr}/full-transactions?limit=20&offset=${page * 20}&resolve_previous_outpoints=light`);
            setTransactions(prev => ([...prev, ...response]));
            setHasMoreTransactions(response.length === 20);
            setTransactionPage(page);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoadingTransactions(false);
        }
    };

    const fetchUtxos = async (addr: string, page: number) => {
        setLoadingUtxos(true);
        try {
            const newUtxos = await simpleRequest<Utxos[]>(`https://api.kaspa.org/addresses/${addr}/utxos?limit=20&offset=${page * 20}`);

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

    const lastTransactionElementRef = useCallback((node: HTMLTableRowElement) => {
        if (loadingTransactions || walletData === null) return;
        if (transactionObserver.current) transactionObserver.current.disconnect();
        transactionObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreTransactions) {
                void fetchTransactions(walletData.address, transactionPage + 1);
            }
        });
        if (node) transactionObserver.current.observe(node);
    }, [loadingTransactions, hasMoreTransactions, walletData, transactionPage]);

    const lastUtxoElementRef = useCallback((node: HTMLTableRowElement) => {
        if (loadingUtxos || walletData === null) return;
        if (utxoObserver.current) utxoObserver.current.disconnect();
        utxoObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreUtxos) {
                void fetchUtxos(walletData.address, utxoPage + 1);
            }
        });
        if (node) utxoObserver.current.observe(node);
    }, [loadingUtxos, hasMoreUtxos, walletData, utxoPage]);

    useEffect(() => {
        if (!walletAddress) {
            return
        }
        setAddress(walletAddress);

        setLoading(true);
        setError(null);

        Promise.all([
            simpleRequest<TokenListResponse<WalletToken[]>>(`https://api.kasplex.org/v1/krc20/address/${walletAddress}/tokenlist`),
            simpleRequest<WalletBalance>(`https://api.kaspa.org/addresses/${walletAddress}/balance`),
            simpleRequest<WalletTotal>(`https://api.kaspa.org/addresses/${walletAddress}/transactions-count`)
        ])
            .then(async ([krc20Response, balanceResponse, transactionCountResponse]) => {

                const krc20Balances: WalletToken[] = krc20Response.result.map(token => ({
                    ...token,
                    balance: token.balance / Math.pow(10, token.dec),
                }));

                setWalletData({
                    address: walletAddress,
                    krc20Balances,
                    kaspaBalance: balanceResponse.balance,
                    transactionCount: transactionCountResponse.total,
                });

                // Reset pagination
                setTransactionPage(0);
                setUtxoPage(0);
                setTransactions([]);
                setUtxos([]);
                setHasMoreTransactions(true);
                setHasMoreUtxos(true);

                // Fetch initial transactions and UTXOs
                await fetchTransactions(walletAddress, 0);
                await fetchUtxos(walletAddress, 0);
            })
            .catch(() => {
                setError('Failed to fetch wallet data. Please try again.');
            })
            .finally(() => {
                setLoading(false);
            })


    }, [walletAddress])

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (address) {
            navigate(`/wallet/${address}`);
        }
    };
    // eslint-disable-next-line
    // @ts-ignore
    const handleAddressChange = (e) => {
        // eslint-disable-next-line
        // @ts-ignore
        setAddress(e.target.value);
    };

    const copyToClipboard = (text: string): void => {
        void navigator.clipboard.writeText(text);
    };

    const openExplorer = (transactionId: string) => {
        window.open(`https://explorer.kaspa.org/txs/${transactionId}`, '_blank', 'noopener,noreferrer');
    };

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
                        <FaSearch/> Search
                    </Button>
                </InputGroup>
            </Form>

            {loading && <LoadingSpinner/>}
            {error && <Alert variant="danger">{error}</Alert>}

            {walletData && (
                <div className="wallet-details">
                    <div className="wallet-overview">
                        <Card>
                            <Card.Body>
                                <Card.Title>Wallet Overview</Card.Title>
                                <Card.Text>
                                    <strong>Address:</strong> {walletData.address}{' '}
                                    <FaCopy className="clickable" onClick={() => copyToClipboard(walletData.address)}/>
                                    <br/>
                                    <strong>Kaspa Balance:</strong> {formatNumber(walletData.kaspaBalance / 1e8)} KAS
                                    <br/>
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
                                {loadingTransactions &&
                                    <div className="loading-message">Loading more transactions...</div>}
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
