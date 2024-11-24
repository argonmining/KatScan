import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Alert, Container, Table} from 'react-bootstrap';
import {FaCopy} from 'react-icons/fa';
import 'styles/WalletLookup.css';
import {censorTicker} from '../utils/censorTicker';
import {TokenListResponse} from "../interfaces/ApiResponseTypes";
import {Utxos, WalletBalance, WalletToken, WalletTotal} from "../interfaces/WalletData";
import {MobileUTXOTable} from "../components/tables/MobileUTXOTable";
import {formatNumber, shortenString} from "../services/Helper";
import {
    CustomTabs,
    Input,
    JsonLd,
    LoadingSpinner,
    NormalCard,
    Page,
    SEO,
    simpleRequest,
    useMobile
} from "nacho-component-library";
import {TransactionOverview} from "../components/tabs/walletOverview/TransactionsOverview";
import {useTransactions} from "../components/tabs/walletOverview/useTransactions";

type InternalWalletData = {
    address: string
    krc20Balances: WalletToken[]
    kaspaBalance: number
    transactionCount: number
}

const WalletLookup: FC = () => {

    const {walletAddress} = useParams();
    const navigate = useNavigate();
    const {isMobile} = useMobile()

    const [address, setAddress] = useState(walletAddress ?? '');
    const transactionData = useTransactions(address)

    const [walletData, setWalletData] = useState<InternalWalletData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [utxos, setUtxos] = useState<Utxos[]>([]);
    const [utxoPage, setUtxoPage] = useState(0);
    const [hasMoreUtxos, setHasMoreUtxos] = useState(true);
    const [loadingUtxos, setLoadingUtxos] = useState(false);

    const utxoObserver = useRef<IntersectionObserver>();

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


    const lastUtxoElementRef = useCallback((node: HTMLTableRowElement) => {
        if (loadingUtxos || walletData === null) {
            return
        }
        if (utxoObserver.current) {
            utxoObserver.current.disconnect()
        }

        utxoObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreUtxos) {
                void fetchUtxos(walletData.address, utxoPage + 1);
            }
        })

        if (node) {
            utxoObserver.current.observe(node)
        }
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
                setUtxoPage(0);
                setUtxos([]);

                setHasMoreUtxos(true);
                // Fetch initial transactions and UTXOs
                await fetchUtxos(walletAddress, 0);
            })
            .catch(() => {
                setError('Failed to fetch wallet data. Please try again.');
            })
            .finally(() => {
                setLoading(false);
            })

    }, [walletAddress])

    const handleSubmit = (e: string | undefined) => {
        if (e) {
            navigate(`/wallet/${e}`);
        }
    };

    const openExplorer = (transactionId: string) => {
        window.open(`https://explorer.kaspa.org/txs/${transactionId}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <Page header={'Wallet Lookup'}>
            <Container className='wallet-lookup'>
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

                <Input customClass={'mb-3'}
                       onSubmit={handleSubmit}
                       value={address}
                       placeholder={'Enter wallet address'}
                       onChangeCallback={setAddress}/>

                {loading && <LoadingSpinner/>}
                {error && <Alert variant="danger">{error}</Alert>}

                {walletData && (
                    <div className="wallet-details">
                        <WalletCard walletData={walletData}/>
                        <CustomTabs titles={['KRC20 Tokens', 'Recent Transactions', 'UTXOs']}>
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
                                        <tr key={token.tick}>
                                            <td>{censorTicker(token.tick)}</td>
                                            <td>{formatNumber(token.balance)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </div>

                            <TransactionOverview {...transactionData}/>

                            {/*todo*/}
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
                        </CustomTabs>
                    </div>
                )}
            </Container>
        </Page>
    );
};

export default WalletLookup;

type WalletCardProps = {
    walletData: InternalWalletData
}
const WalletCard: FC<WalletCardProps> = (
    {
        walletData
    }
) => {

    const copyToClipboard = (text: string): void => {
        void navigator.clipboard.writeText(text);
    };

    return <div className="wallet-overview">
        <NormalCard title={'Wallet Overview'}>
            <div className={'grid'}>
                <strong>Address:</strong>
                <div>
                    {walletData.address}
                    <FaCopy className="clickable"
                            onClick={() => copyToClipboard(walletData.address)}/>
                </div>

                <strong>Kaspa Balance:</strong>
                <div>{formatNumber(walletData.kaspaBalance / 1e8)} KAS</div>
                <strong>Transaction Count:</strong> {walletData.transactionCount}
            </div>
        </NormalCard>
    </div>
}