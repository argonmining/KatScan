import React, {FC, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Alert, Card} from 'react-bootstrap';
import {getTokenDetails} from '../services/dataService';
import 'styles/TokenDetail.css';
import {censorTicker} from '../utils/censorTicker';
import SEO from '../components/SEO';
import JsonLd from '../components/JsonLd';
import {LoadingSpinner} from "../components/LoadingSpinner";
import {TokenSearchResult} from "../interfaces/TokenData";
import {formatDateTime, formatNumber, parseRawNumber} from "../services/Helper";
import {useMobile} from "../hooks/mobile";
import {HolderDistribution} from "../components/tabs/tokendetail/HolderDistribution";
import {RecentOperations} from "../components/tabs/tokendetail/RecentOperations";
import {TopHolder} from "../components/tabs/tokendetail/TopHolder";
import {MintActivity} from "../components/tabs/tokendetail/MintActivity";
import {CustomTabs} from "../components/CustomTabs";
import {useRegister} from "../hooks/useRegister";

const titles = ['Top Holders', 'Recent Operations', 'Holder Distribution', 'Mint Activity']

const TokenDetail: FC = () => {
        const {tokenId} = useParams();
        const [tokenData, setTokenData] = useState<TokenSearchResult | null>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const {isMobile} = useMobile()
        useRegister()

        useEffect(() => {
            if (!tokenId) {
                return
            }

            setLoading(true);
            setError(null);

            getTokenDetails(tokenId)
                .then((data) => {
                    if (!data) {
                        throw new Error('No data returned from API');
                    }
                    setTokenData(data);
                })
                .catch(err => {
                    console.error('Failed to fetch token details:', err);
                    setError('Failed to fetch token details');
                })
                .finally(() => setLoading(false));

        }, [tokenId]);

        if (loading) return <LoadingSpinner/>
        if (error) return <Alert variant="danger">{error}</Alert>;
        if (!tokenData) return <Alert variant="warning">No data available</Alert>;

        const jsonLdData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `${tokenData.tick} Token Details | KatScan`,
            "description": `Detailed information about the KRC-20 token ${tokenData.tick} on the Kaspa blockchain.`,
            "url": `https://katscan.xyz/tokens/${tokenId ?? ''}`,
        };

        return (
            <div className="token-detail">
                <JsonLd data={jsonLdData}/>
                <SEO
                    title="Token Details"
                    description="Explore detailed information about a specific KRC-20 token on the Kaspa blockchain."
                    keywords="KRC-20, Kaspa, token details, blockchain explorer, token information"
                />
                <div className="token-header">
                    <h1>Token Details: {censorTicker(tokenData.tick)}</h1>
                    <span className="creation-date">
          Deployed on {formatDateTime(tokenData.mtsAdd.toString())}
        </span>
                </div>
                <Card className="token-info-card">
                    <Card.Body>
                        <div className="token-info-grid">
                            <div className="token-info-item">
                                <span className="token-info-label">Max Supply</span>
                                <span
                                    className="token-info-value">{formatNumber(parseRawNumber(tokenData.max, tokenData.dec), tokenData.dec)}</span>
                            </div>
                            <div className="token-info-item">
                                <span className="token-info-label">Total Minted</span>
                                <span
                                    className="token-info-value">{formatNumber(parseRawNumber(tokenData.minted, tokenData.dec), tokenData.dec)}</span>
                            </div>
                            <div className="token-info-item">
                                <span className="token-info-label">Limit per Mint</span>
                                <span
                                    className="token-info-value">{formatNumber(parseRawNumber(tokenData.lim, tokenData.dec), tokenData.dec)}</span>
                            </div>
                            <div className="token-info-item">
                                <span className="token-info-label">Total Mints</span>
                                <span className="token-info-value">{formatNumber(tokenData.mintTotal, 0)}</span>
                            </div>
                            <div className="token-info-item">
                                <span className="token-info-label">Total Holders</span>
                                <span className="token-info-value">{formatNumber(tokenData.holderTotal, 0)}</span>
                            </div>
                            <div className="token-info-item">
                                <span className="token-info-label">Total Transfers</span>
                                <span className="token-info-value">{formatNumber(tokenData.transferTotal, 0)}</span>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <CustomTabs titles={titles}>
                    <TopHolder tokenData={tokenData}/>
                    <RecentOperations tokenData={tokenData} tokenId={tokenId}/>
                    <HolderDistribution tokenData={tokenData}/>
                    {!isMobile && <MintActivity tokenData={tokenData}/>}
                </CustomTabs>
            </div>
        );
    }
;


export default TokenDetail;