import React, { FC, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { FaCopy } from 'react-icons/fa';
import {
    Input,
    JsonLd,
    LoadingSpinner,
    NormalCard,
    Page,
    SEO,
} from "nacho-component-library";
import { copyToClipboard } from "../services/Helper";
import { knsService } from "../services/knsService";
import { addAlert } from "../components/alerts/Alerts";
import 'styles/WalletLookup.css';

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

const KNSLookup: FC = () => {
    const { domain } = useParams();
    const navigate = useNavigate();

    const [searchDomain, setSearchDomain] = useState(domain ?? '');
    const [domainData, setDomainData] = useState<{ domain: string; owner: string; assetId: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (input: string | undefined) => {
        if (!input) return;

        setLoading(true);
        try {
            const response = await knsService.getDomainOwner(input);
            if (response.success) {
                setDomainData({
                    domain: response.data.asset,
                    owner: response.data.owner,
                    assetId: response.data.assetId
                });
                navigate(`/kns/${input}`);
            }
        } catch (error) {
            addAlert('error', 'Failed to fetch domain information. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Page header={'KNS Domain Lookup'}>
            <Container className='wallet-lookup'>
                <SEO
                    title="KNS Domain Lookup"
                    description="Look up owner information for any KNS domain on Kaspa."
                    keywords="KNS, Kaspa Name Service, domain lookup, Kaspa"
                />
                <JsonLd
                    data={{
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "KatScan KNS Domain Lookup",
                        "description": "Look up owner information for any KNS domain on Kaspa.",
                        "url": "https://katscan.xyz/kns"
                    }}
                />

                <Input
                    customClass={'mb-3'}
                    onSubmit={handleSubmit}
                    value={searchDomain}
                    placeholder={'Enter KNS domain (e.g., example.kas)'}
                    onChangeCallback={setSearchDomain}
                />
                <TestnetNotice />

                {loading && <LoadingSpinner />}

                {domainData && (
                    <div className="wallet-details">
                        <NormalCard title={'Domain Information'}>
                            <div className={'grid'}>
                                <strong>Domain:</strong>
                                <div>{domainData.domain}</div>

                                <strong>Owner:</strong>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Link 
                                        to={`/wallet/${domainData.owner}`}
                                        style={{ color: 'inherit', textDecoration: 'underline' }}
                                    >
                                        {domainData.owner}
                                    </Link>
                                    <FaCopy
                                        className="clickable"
                                        onClick={() => copyToClipboard(domainData.owner)}
                                    />
                                </div>

                                <strong>Asset ID:</strong>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {domainData.assetId}
                                    <FaCopy
                                        className="clickable"
                                        onClick={() => copyToClipboard(domainData.assetId)}
                                    />
                                </div>
                            </div>
                        </NormalCard>
                    </div>
                )}
            </Container>
        </Page>
    );
};

export default KNSLookup; 