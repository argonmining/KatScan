import React, {FC, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Alert} from 'react-bootstrap';
import 'styles/TokenDetail.css';
import {censorTicker} from '../utils/censorTicker';
import {TokenData, TokenHolder} from "../interfaces/TokenData";
import {formatDateTime} from "../services/Helper";
import {HolderDistribution} from "../components/tabs/tokendetail/HolderDistribution";
import {RecentOperations} from "../components/tabs/tokendetail/RecentOperations";
import {TopHolder} from "../components/tabs/tokendetail/TopHolder";
// import {MintActivity, MintOvertimeType} from "../components/tabs/tokendetail/MintActivity";
import {OpTransactionData} from "../interfaces/OpTransactionData";
import {TokenListResponse} from "../interfaces/ApiResponseTypes";
import {CustomTabs, JsonLd, LoadingSpinner, Page, SEO, useMobile} from "nacho-component-library";
import {TokenDetailsTokenInfo} from "../components/TokenDetailsTokenInfo";
import {useFetch} from "../hooks/useFetch";
import {katscanApiUrl} from "../utils/StaticVariables";

export type Socials = Record<string, string>

const titles = ['Top Holders', 'Recent Operations', 'Holder Distribution']
const mobileTabs = ['General Info', 'Additional Info']

const TokenDetail: FC = () => {
        const {tokenId} = useParams();
        const [holderData, setHolderData] = useState<TokenHolder[]>([]);
        const {isMobile} = useMobile()
        // const [mintActivity, setMintActivity] = useState<MintOvertimeType[]>([]);
        const [operations, setOperations] = useState<OpTransactionData[]>([]);
        const [operationsCursor, setOperationsCursor] = useState<TokenListResponse<OpTransactionData[]>['next'] | null>(null);
        const [socials, setSocials] = useState<Socials>({})
        if (!isMobile) {
            // disable until endpoint done
            // titles[3] = 'Mint Activity'
        }
        const {data, loading} = useFetch<TokenData>({
            url: `${katscanApiUrl}/token/detail/${tokenId ?? ''}`,
            avoidLoading: !tokenId,
            defaultValue: null,
            errorMessage: 'Failed to fetch token details, is the TICK correct?'
        })

        useEffect(() => {
            if (!data || !tokenId) {
                return
            }

            if (!data) {
                throw new Error('No data returned from API');
            }

            setSocials((data.socials ? JSON.parse(data.socials) : {}) as Socials)

        }, [data, tokenId]);

        if (loading) return <LoadingSpinner/>
        if (!data) return <Alert variant="warning">No data available</Alert>;

        const jsonLdData = {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `${data.tick} Token Details | KatScan`,
            "description": `Detailed information about the KRC-20 token ${data.tick} on the Kaspa blockchain.`,
            "url": `https://katscan.xyz/tokens/${tokenId ?? ''}`,
        };

        return (
            <Page header={`Token Details: ${censorTicker(data.tick)}`}
                  additionalHeaderComponent={<span className="creation-date">
                    Deployed on {formatDateTime(data.mtsAdd)}
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
                            <TokenDetailsTokenInfo tokenData={data} socials={socials}/>
                            <CustomTabs titles={titles}>
                                <TopHolder tokenData={data} holderData={holderData} setHolderData={setHolderData}/>
                                <RecentOperations tokenData={data}
                                                  tokenId={tokenId}
                                                  setOperations={setOperations}
                                                  operations={operations}
                                                  operationsCursor={operationsCursor}
                                                  setOperationsCursor={setOperationsCursor}/>
                                <HolderDistribution tokenData={data} tokenHolder={holderData}/>
                            </CustomTabs>
                        </CustomTabs>
                        : <>
                            <TokenDetailsTokenInfo tokenData={data} socials={socials}/>
                            <CustomTabs titles={titles}>
                                <TopHolder tokenData={data} holderData={holderData} setHolderData={setHolderData}/>
                                <RecentOperations tokenData={data}
                                                  tokenId={tokenId}
                                                  setOperations={setOperations}
                                                  operations={operations}
                                                  operationsCursor={operationsCursor}
                                                  setOperationsCursor={setOperationsCursor}/>
                                <HolderDistribution tokenData={data} tokenHolder={holderData}/>
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