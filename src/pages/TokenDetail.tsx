import React, {FC, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Alert} from 'react-bootstrap';
import {getTokenDetails, getDetailedTokenInfo} from '../services/dataService';
import 'styles/TokenDetail.css';
import {censorTicker} from '../utils/censorTicker';
import {TokenSearchResult} from "../interfaces/TokenData";
import {formatDateTime} from "../services/Helper";
import {HolderDistribution} from "../components/tabs/tokendetail/HolderDistribution";
import {RecentOperations} from "../components/tabs/tokendetail/RecentOperations";
import {TopHolder} from "../components/tabs/tokendetail/TopHolder";
// import {MintActivity, MintOvertimeType} from "../components/tabs/tokendetail/MintActivity";
import {OpTransactionData} from "../interfaces/OpTransactionData";
import {TokenListResponse} from "../interfaces/ApiResponseTypes";
import {Page, CustomTabs, JsonLd, LoadingSpinner, SEO, simpleRequest, useMobile} from "nacho-component-library";
import {TokenDetailsTokenInfo} from "../components/TokenDetailsTokenInfo";
import {addAlert} from "../components/alerts/Alerts";

export type Socials = { type: string, url: string }

const titles = ['Top Holders', 'Recent Operations', 'Holder Distribution']
const mobileTabs = ['General Info', 'Additional Info']

const TokenDetail: FC = () => {
        const {tokenId} = useParams();
        const [tokenData, setTokenData] = useState<TokenSearchResult | null>(null);
        const [holderData, setHolderData] = useState<TokenSearchResult | null>(null);
        const [loading, setLoading] = useState(true);
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
            void getTokenDetails(tokenId).then((data) => {
                Promise.all([
                    getDetailedTokenInfo(tokenId),
                    simpleRequest<Record<string, unknown>>(`https://api-v2-do.kas.fyi/token/krc20/${tokenId}/info?includeCharts=false`)
                ])
                    .then(([detailedData, tokenInfo]) => {
                        if (!data) {
                            throw new Error('No data returned from API');
                        }
                        setTokenData(data.result);
                        setHolderData(detailedData);
                        setSocials((tokenInfo?.socialLinks ?? []) as Socials[])
                    })
                    .catch(err => {
                        console.error('Failed to fetch token details:', err);
                        addAlert('error', 'Failed to fetch token details');
                    })
                    .finally(() => setLoading(false));
            }).catch(err => {
                console.error('Failed to fetch token details:', err);
                addAlert('error', 'Failed to fetch token details, is the TICK correct?');
                setLoading(false)
            })
        }, [tokenId]);

        if (loading) return <LoadingSpinner/>
        if (!tokenData) return <Alert variant="warning">No data available</Alert>;

        const jsonLdData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `${tokenData.tick} Token Details | KatScan`,
            "description": `Detailed information about the KRC-20 token ${tokenData.tick} on the Kaspa blockchain.`,
            "url": `https://katscan.xyz/tokens/${tokenId ?? ''}`,
        };

        return (
            <Page header={`Token Details: ${censorTicker(tokenData.tick)}`}
                  additionalHeaderComponent={<span className="creation-date">
                    Deployed on {formatDateTime(tokenData.mtsAdd)}
                </span>}>
                <div className="token-detail">
                    <JsonLd data={jsonLdData}/>
                    <SEO
                        title="Token Details"
                        description="Explore detailed information about a specific KRC-20 token on the Kaspa blockchain."
                        keywords="KRC-20, Kaspa, token details, blockchain explorer, token information"
                    />

                    {isMobile
                        ?
                        <CustomTabs titles={mobileTabs}>
                            <TokenDetailsTokenInfo tokenData={tokenData} socials={socials}/>
                            <CustomTabs titles={titles}>
                                <TopHolder tokenData={holderData || tokenData}/>
                                <RecentOperations tokenData={tokenData}
                                                  tokenId={tokenId}
                                                  setOperations={setOperations}
                                                  operations={operations}
                                                  operationsCursor={operationsCursor}
                                                  setOperationsCursor={setOperationsCursor}/>
                                <HolderDistribution tokenData={holderData || tokenData}/>
                            </CustomTabs>
                        </CustomTabs>
                        : <>
                            <TokenDetailsTokenInfo tokenData={tokenData} socials={socials}/>
                            <CustomTabs titles={titles}>
                                <TopHolder tokenData={holderData || tokenData}/>
                                <RecentOperations tokenData={tokenData}
                                                  tokenId={tokenId}
                                                  setOperations={setOperations}
                                                  operations={operations}
                                                  operationsCursor={operationsCursor}
                                                  setOperationsCursor={setOperationsCursor}/>
                                <HolderDistribution tokenData={holderData || tokenData}/>
                                {/*{!isMobile && <MintActivity tokenData={tokenData} mintActivityData={mintActivity}*/}
                                {/*                            setMintActivityData={setMintActivity}/>}*/}
                            </CustomTabs>
                        </>}

                </div>
            </Page>
        );
    }
;


export default TokenDetail;