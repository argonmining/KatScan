import React, {FC, useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {Alert, Card} from 'react-bootstrap';
import {getTokenDetails} from '../services/dataService';
import 'styles/TokenDetail.css';
import {censorTicker} from '../utils/censorTicker';
import {TokenSearchResult} from "../interfaces/TokenData";
import {formatDateTime, formatNumber, parseRawNumber} from "../services/Helper";
import {HolderDistribution} from "../components/tabs/tokendetail/HolderDistribution";
import {RecentOperations} from "../components/tabs/tokendetail/RecentOperations";
import {TopHolder} from "../components/tabs/tokendetail/TopHolder";
// import {MintActivity, MintOvertimeType} from "../components/tabs/tokendetail/MintActivity";
import {OpTransactionData} from "../interfaces/OpTransactionData";
import {TokenListResponse} from "../interfaces/ApiResponseTypes";
import {iconBaseUrl} from "../utils/StaticVariables";
import {
    CustomTabs,
    JsonLd,
    LoadingSpinner,
    SEO,
    simpleRequest,
    SmallThumbnail,
    Thumbnail,
    useMobile
} from "nacho-component-library/dist";

const titles = ['Top Holders', 'Recent Operations', 'Holder Distribution']

type Socials = { type: string, url: string }

const TokenDetail: FC = () => {
        const {tokenId} = useParams();
        const [tokenData, setTokenData] = useState<TokenSearchResult | null>(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);
        const {isMobile} = useMobile()
        // const [mintActivity, setMintActivity] = useState<MintOvertimeType[]>([]);
        const [operations, setOperations] = useState<OpTransactionData[]>([]);
        const [operationsCursor, setOperationsCursor] = useState<TokenListResponse<OpTransactionData[]>['next'] | null>(null);
        const [socials, setSocials] = useState<Socials[]>([])
        if (!isMobile) {
            // disable until endpoint done
            // titles[3] = 'Mint Activity'
        }

        useEffect(() => {
            if (!tokenId) {
                return
            }

            setLoading(true);
            setError(null);
            Promise.all([
                getTokenDetails(tokenId),
                simpleRequest<Record<string, unknown>>(`https://api-v2-do.kas.fyi/token/krc20/${tokenId}/info?includeCharts=false`)
            ])
                .then(([data, tokenInfo]) => {
                    if (!data) {
                        throw new Error('No data returned from API');
                    }
                    setTokenData(data);
                    setSocials((tokenInfo?.socialLinks ?? []) as Socials[])
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

        const getIcon = (type: string) => {
            switch (type){
                case 'twitter':
                    return <SmallThumbnail src={"https://kas.fyi/media/svg/brand-logos/twitter.svg"} alt={'twitter'}/>
                case 'discord':
                    return <SmallThumbnail src={"https://kas.fyi/media/svg/brand-logos/discord.svg"} alt={'discord'}/>
                case 'telegram':
                    return <SmallThumbnail src={"https://kas.fyi/media/svg/brand-logos/telegram.svg"} alt={'telegram'}/>
                default:
                    return <SmallThumbnail src={`${iconBaseUrl}${tokenData.tick}.jpg`} alt={'website'}/>
            }
        }

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
                            <div className="token-info-item-image">
                                <Thumbnail src={`${iconBaseUrl}${tokenData.tick}.jpg`} alt={`${tokenData.tick}.jpg`}/>
                            </div>
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
                            <div className="token-info-socials">
                                <span className="token-info-label">Socials</span>
                                <div className={'token-info-socials-wrapper'}>
                                    {socials.map(single =>
                                        <Link key={single.type} to={single.url}>
                                            {getIcon(single.type)}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card.Body>
                </Card>

                <CustomTabs titles={titles}>
                    <TopHolder tokenData={tokenData}/>
                    <RecentOperations tokenData={tokenData}
                                      tokenId={tokenId}
                                      setOperations={setOperations}
                                      operations={operations}
                                      operationsCursor={operationsCursor}
                                      setOperationsCursor={setOperationsCursor}/>
                    <HolderDistribution tokenData={tokenData}/>
                    {/*{!isMobile && <MintActivity tokenData={tokenData} mintActivityData={mintActivity}*/}
                    {/*                            setMintActivityData={setMintActivity}/>}*/}
                </CustomTabs>
            </div>
        );
    }
;


export default TokenDetail;