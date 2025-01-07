import React, {FC, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Container, Table} from 'react-bootstrap';
import {FaCopy} from 'react-icons/fa';
import 'styles/WalletLookup.css';
import {censorTicker} from '../utils/censorTicker';
import {TokenListResponse} from "../interfaces/ApiResponseTypes";
import {WalletBalance, WalletToken, WalletTotal} from "../interfaces/WalletData";
import {copyToClipboard, formatNumber} from "../services/Helper";
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
import {useTransactions} from "../components/tabs/walletOverview/hooks/useTransactions";
import {useUTXOs} from "../components/tabs/walletOverview/hooks/useUTXOs";
import {UTXOOverview} from "../components/tabs/walletOverview/UTXOOverview";
import {addAlert} from "../components/alerts/Alerts";
import { knsService, KNSAsset } from "../services/knsService";

type InternalWalletData = {
    address: string
    krc20Balances: WalletToken[]
    kaspaBalance: number
    transactionCount: number
}

const mobileTabs = ['General Info', 'Additional Info']

const WalletLookup: FC = () => {

    const {walletAddress} = useParams();
    const navigate = useNavigate();
    const {isMobile} = useMobile()

    const [address, setAddress] = useState(walletAddress ?? '');
    const [addressValid, setAddressValid] = useState(false)
    const transactionData = useTransactions(addressValid, walletAddress)
    const utxoData = useUTXOs(addressValid, walletAddress)

    const [walletData, setWalletData] = useState<InternalWalletData | null>(null);
    const [loading, setLoading] = useState(false);
    const [knsAssets, setKnsAssets] = useState<KNSAsset[]>([]);

    useEffect(() => {
        if (!walletAddress) {
            return;
        }

        setAddress(walletAddress);

        if (walletAddress.startsWith('kaspatest:')) {
            // For testnet addresses, only fetch KNS data and set empty wallet data
            setLoading(true);
            knsService.getAssetsByOwner(walletAddress)
                .then(response => {
                    if (response.success) {
                        setKnsAssets(response.data.assets);
                    }
                    // Set empty wallet data for testnet addresses
                    setWalletData({
                        address: walletAddress,
                        krc20Balances: [],
                        kaspaBalance: 0,
                        transactionCount: 0,
                    });
                    setAddressValid(true);
                })
                .catch(error => {
                    console.error('Failed to fetch KNS assets:', error);
                    addAlert('error', 'Failed to fetch KNS data. Please try again.');
                    setAddressValid(false);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            // For mainnet addresses, fetch regular wallet data
            setLoading(true);
            simpleRequest<WalletBalance>(`https://api.kaspa.org/addresses/${walletAddress}/balance`)
                .then(balanceResponse => {
                    setAddressValid(true);
                    Promise.all([
                        simpleRequest<TokenListResponse<WalletToken[]>>(`https://api.kasplex.org/v1/krc20/address/${walletAddress}/tokenlist`),
                        simpleRequest<WalletTotal>(`https://api.kaspa.org/addresses/${walletAddress}/transactions-count`)
                    ])
                        .then(([krc20Response, transactionCountResponse]): void => {
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
                        })
                        .catch(() => {
                            addAlert('error', 'Failed to fetch wallet data. Please try again.');
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                })
                .catch(() => {
                    addAlert('error', 'Failed to fetch wallet data. Is the wallet address correct?');
                    setLoading(false);
                    setAddressValid(false);
                });

            // Clear any existing KNS assets for mainnet addresses
            setKnsAssets([]);
        }
    }, [walletAddress]);

    const handleSubmit = (e: string | undefined) => {
        if (e) {
            navigate(`/wallet/${e}`);
        }
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

                {walletData && (
                    <div className="wallet-details">
                        {isMobile
                            ? <CustomTabs titles={mobileTabs}>
                                <WalletCard walletData={walletData}/>
                                <CustomTabs titles={['KRC20 Tokens', 'KNS Assets', 'Recent Transactions', 'UTXOs']}>
                                    <TokenBalance walletData={walletData}/>
                                    <KNSAssetsTab 
                                        assets={knsAssets}
                                        walletAddress={walletData.address}
                                    />
                                    <TransactionOverview {...transactionData}/>
                                    <UTXOOverview {...utxoData}/>
                                </CustomTabs>
                            </CustomTabs>
                            : <>
                                <WalletCard walletData={walletData}/>
                                <CustomTabs titles={['KRC20 Tokens', 'KNS Assets', 'Recent Transactions', 'UTXOs']}>
                                    <TokenBalance walletData={walletData}/>
                                    <KNSAssetsTab 
                                        assets={knsAssets}
                                        walletAddress={walletData.address}
                                    />
                                    <TransactionOverview {...transactionData}/>
                                    <UTXOOverview {...utxoData}/>
                                </CustomTabs>
                            </>
                        }
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

type TokenBalanceType = {
    walletData: InternalWalletData
}

export const TokenBalance: FC<TokenBalanceType> = (
    {
        walletData
    }
) => {
    return <div className="table-wrapper">
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
}

const TestnetNotice: FC = () => (
    <div style={{
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        border: '1px solid #ffc107',
        borderRadius: '4px',
        padding: '8px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    }}>
        <span style={{
            backgroundColor: '#ffc107',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
        }}>
            TESTNET-10
        </span>
        <span>This feature is currently running on Kaspa Testnet-10</span>
    </div>
);

type KNSAssetsTabProps = { 
    assets: KNSAsset[];
    walletAddress: string;
}

const KNSAssetsTab: FC<KNSAssetsTabProps> = ({ assets, walletAddress }) => {
    return (
        <div className="table-wrapper">
            <TestnetNotice />
            {!walletAddress.startsWith('kaspatest:') ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    KNS assets are only available for Testnet addresses (kaspatest:)
                </div>
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Asset</th>
                            <th>Type</th>
                            <th>Verified</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assets.map((asset) => (
                            <tr key={asset.id}>
                                <td>{asset.asset}</td>
                                <td>{asset.isDomain ? 'Domain' : 'Asset'}</td>
                                <td>{asset.isVerifiedDomain ? 'Yes' : 'No'}</td>
                                <td>{new Date(asset.creationBlockTime).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};