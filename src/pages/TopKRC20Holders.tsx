import React, {FC, ReactElement, useEffect, useState} from 'react';
import {Table} from 'react-bootstrap';
import {Link} from 'react-router-dom';
import 'styles/TopKRC20Holders.css';
import {censorTicker} from '../utils/censorTicker';
import {useMediaQuery} from 'react-responsive';
import {TopHolder} from "../interfaces/TokenData";
import {MobileTopKRC20Holders} from "../components/mobileComponents/MobileTopKRC20Holders";
import {ExpandAbleList, JsonLd, Page, SEO, simpleRequest} from "nacho-component-library";
import {addAlert} from "../components/alerts/Alerts";

const API_BASE_URL = 'https://katapi.nachowyborski.xyz/api/topHolders';

type InternalTopHolder = {
    address: string
    tokens: { tick: string, amount: number, decimals: number }[]
    uniqueTokens: number
}

//Outside of the component because its static
const headEntries = ['Rank', 'Address', 'Unique Tokens', 'Expand']

const TopKRC20Holders: FC = () => {
    const [topHolders, setTopHolders] = useState<InternalTopHolder[]>([]);
    const [loading, setLoading] = useState(true);
    const isMobile = useMediaQuery({maxWidth: 768});

    useEffect(() => {
        const fetchTopHolders = async () => {
            try {
                setLoading(true);
                const holders = await simpleRequest<TopHolder[]>(API_BASE_URL);

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
                addAlert('error', 'Failed to fetch top holders data. Please try again later.');
                setLoading(false);
            }
        };

        void fetchTopHolders();
    }, []);

    const getRow = (holder: InternalTopHolder, index: number): ReactElement => {
        return <>
            <td>{index + 1}</td>
            <td>
                <Link to={`/wallet/${holder.address}`} className="clickable-address">
                    {holder.address}
                </Link>
            </td>
            <td>{holder.uniqueTokens}</td>
        </>
    }

    const getExpandRow = (holder: InternalTopHolder): ReactElement => {
        return <td colSpan={4}>
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
                        <td>{censorTicker(token.tick)}</td>
                        <td>{token.amount.toLocaleString(undefined, {maximumFractionDigits: token.decimals})}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </td>
    }

    return (
        <Page header={'Top KRC20 Token Holders'}>
            <div className="top-krc20-holders-wrapper">
                <SEO
                    title="Top KRC-20 Token Holders"
                    description="Explore the top holders of KRC-20 tokens on the Kaspa blockchain, ranked by unique token holdings."
                    keywords="KRC-20, Kaspa, top holders, token distribution, whale analysis"
                />
                <JsonLd
                    data={{
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "KatScan Top KRC-20 Token Holders",
                        "description": "Explore the top holders of KRC-20 tokens on the Kaspa blockchain, ranked by unique token holdings.",
                        "url": "https://katscan.xyz/top-holders"
                    }}
                />
                {isMobile ? <MobileTopKRC20Holders holders={topHolders}/>
                    : (
                        <div className="table-container">
                            <ExpandAbleList headEntries={headEntries}
                                            isLoading={loading}
                                            entries={topHolders}
                                            getRowData={getRow}
                                            getExpandData={getExpandRow}/>
                        </div>
                    )}
            </div>
        </Page>
    );
};

export default TopKRC20Holders;
