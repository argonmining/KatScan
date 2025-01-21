import React, {FC, useEffect, useState} from 'react';
import {Button, Card, Col, Container, Form, Row} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import AsyncSelect from 'react-select/async';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faChartLine,
    faCoins,
    faDollarSign,
    faExternalLinkAlt,
    faInfoCircle,
    faUsers
} from '@fortawesome/free-solid-svg-icons';
import {getDetailedTokenInfo} from '../services/dataService';
import {CryptoSearch, getCryptoData, searchCryptos} from '../services/coingeckoService';
import 'styles/MarketCapCalculator.css';
import {censorTicker} from '../utils/censorTicker';
import {TokenData} from "../interfaces/TokenData";
import {CoinbaseInfo} from "../interfaces/CoinbaseInfo";
import {formatInteger, formatNumber} from "../services/Helper";
import {JsonLd, LoadingSpinner, NormalCard, Page, SEO} from "nacho-component-library";
import {addAlert} from "../components/alerts/Alerts";
import {useFetch} from "../hooks/useFetch";
import {CustomSelect, Selection} from "../components/select/CustomSelect";

type CalculationResult = {
    krc20Token: {
        holderTotal: number
    } & TokenData,
    crypto: {
        maxSupply: CoinbaseInfo['market_data']['max_supply'],
        marketCap: CoinbaseInfo['market_data']['market_cap']['usd'],
        currentPrice: CoinbaseInfo['market_data']['current_price']['usd']
    } & CryptoSearch & CoinbaseInfo,
    calculatedPrice: number
    krc20Supply: number
    cryptoMarketCap: number
}

type InternalKRC20 = {
    value: string
    label: string
    tick: string
}

const jsonData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "KatScan Market Cap Calculator",
    "description": "Calculate and compare market caps of KRC-20 tokens on the Kaspa network.",
    "url": "https://katscan.xyz/marketcap-calc"
}
const MarketCapCalculator: FC = () => {

    const [krc20List, setKrc20List] = useState<InternalKRC20[]>([]);
    const [selectedKrc20Token, setSelectedKrc20Token] = useState<Selection | null>(null);
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoSearch | null>(null);
    const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [detailedTokenInfo, setDetailedTokenInfo] = useState<TokenData | null>(null);
    const {data} = useFetch<TokenData['tick'][]>({
        url: '/token/tickers'
    })

    const navigate = useNavigate();
    useEffect(() => {
        if (!data || data.length === 0) {
            return
        }
        setKrc20List(data.map(token => ({
            value: token,
            label: censorTicker(token),
            tick: token
        })))
    }, [data]);

    const handleCryptoSearch = async (inputValue: string): Promise<CryptoSearch[]> => {
        if (inputValue.length > 1) {
            try {
                return await searchCryptos(inputValue);
            } catch (error) {
                console.error('Error searching cryptocurrencies:', error);
                return [];
            }
        }
        return [];
    };

    useEffect(() => {
        if (!selectedKrc20Token) {
            return
        }
        const fetchDetailedTokenInfo = async (tick: string) => {
            try {
                const data = await getDetailedTokenInfo(tick);
                setDetailedTokenInfo(data);
            } catch (error) {
                console.error('Error fetching detailed token info:', error);
            }
        }
        void fetchDetailedTokenInfo(selectedKrc20Token.value as string);

    }, [selectedKrc20Token]);

    useEffect(() => {
        if (selectedKrc20Token && selectedCrypto && detailedTokenInfo) {
            setIsLoading(true);
            const load = async () => {
                try {
                    const cryptoData = await getCryptoData(selectedCrypto.value);
                    const krc20Supply = detailedTokenInfo.max / Math.pow(10, detailedTokenInfo.dec);
                    const cryptoMarketCap = cryptoData.market_data.market_cap.usd;
                    const calculatedPrice = cryptoMarketCap / krc20Supply;

                    setCalculationResult({
                        krc20Token: {
                            ...detailedTokenInfo,
                            holderTotal: detailedTokenInfo.holderTotal
                        },
                        crypto: {
                            ...selectedCrypto,
                            ...cryptoData,
                            maxSupply: cryptoData.market_data.max_supply,
                            marketCap: cryptoMarketCap,
                            currentPrice: cryptoData.market_data.current_price.usd
                        },
                        calculatedPrice,
                        krc20Supply,
                        cryptoMarketCap
                    });
                } catch (error) {
                    console.error('Error calculating market cap:', error);
                    addAlert('error', 'Failed to calculate market cap. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            }
            void load()
        }

    }, [detailedTokenInfo, selectedCrypto, selectedKrc20Token]);

    const handleKRC20DetailClick = (): void => {
        if (calculationResult && calculationResult.krc20Token) {
            navigate(`/tokens/${calculationResult.krc20Token.tick}`);
        }
    };

    const handleCoinGeckoClick = (): void => {
        if (calculationResult && calculationResult.crypto) {
            window.open(`https://www.coingecko.com/en/coins/${calculationResult.crypto.id}`, '_blank');
        }
    };

    return (
        <Page header={'MarketCap Calculator'}>
            <Container fluid className="market-cap-calculator">
                <SEO title="Market Cap Calculator"
                     description="Calculate and compare market caps of KRC-20 tokens on the Kaspa network."
                     keywords="KRC-20, Kaspa, market cap, calculator, cryptocurrency"/>
                <JsonLd data={jsonData}/>
                <Row className="justify-content-center">
                    <Col md={10} lg={8}>
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Select KRC20 Token</Form.Label>
                                    <CustomSelect placeholder={"Select KRC20 Token"}
                                                  data={krc20List}
                                                  hasSearch={true}
                                                  onSelect={setSelectedKrc20Token}/>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Select Cryptocurrency</Form.Label>
                                    <AsyncSelect
                                        cacheOptions
                                        loadOptions={handleCryptoSearch}
                                        onChange={setSelectedCrypto}
                                        placeholder="Start typing a cryptocurrency on CoinGecko"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        {isLoading && (
                            <LoadingSpinner/>
                        )}
                        {calculationResult && (
                            <div className="calculation-result">
                                <h4 className="text-center mb-4">Calculation Result</h4>
                                <Row>
                                    <Col md={6} className="mb-4">
                                        <Card className="h-100 token-card krc20-card">
                                            <Card.Body>
                                                <h5 className="text-center">{censorTicker(calculationResult.krc20Token.tick)} (KRC20
                                                    Token)</h5>
                                                <ul className="list-unstyled">
                                                    <li className="d-flex justify-content-between align-items-center mb-2">
                                                            <span><FontAwesomeIcon icon={faCoins}
                                                                                   className="me-2 text-primary"/> Max Supply:</span>
                                                        <strong>{formatNumber(calculationResult.krc20Supply)}</strong>
                                                    </li>
                                                    <li className="d-flex justify-content-between align-items-center mb-2">
                                                            <span><FontAwesomeIcon icon={faUsers}
                                                                                   className="me-2 text-primary"/> Total Holders:</span>
                                                        <strong>{formatInteger(calculationResult.krc20Token.holderTotal)}</strong>
                                                    </li>
                                                    <li className="d-flex justify-content-between align-items-center">
                                                            <span><FontAwesomeIcon icon={faChartLine}
                                                                                   className="me-2 text-primary"/> Total Minted:</span>
                                                        <strong>{formatNumber(calculationResult.krc20Token.minted / Math.pow(10, calculationResult.krc20Token.dec || 0))}</strong>
                                                    </li>
                                                </ul>
                                                <div className="text-center mt-3">
                                                    <Button
                                                        variant="primary"
                                                        onClick={handleKRC20DetailClick}
                                                        className="details-button"
                                                    >
                                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="me-2"/>
                                                        {censorTicker(calculationResult.krc20Token.tick)} Details
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={6} className="mb-4">
                                        <Card className="h-100 token-card coingecko-card">
                                            <Card.Body>
                                                <h5 className="text-center">{calculationResult.crypto.symbol.toUpperCase()} (CoinGecko)</h5>
                                                <ul className="list-unstyled">
                                                    <li className="d-flex justify-content-between align-items-center mb-2">
                                                            <span><FontAwesomeIcon icon={faCoins}
                                                                                   className="me-2 text-success"/> Max Supply:</span>
                                                        <strong>{calculationResult.crypto.maxSupply ? formatNumber(calculationResult.crypto.maxSupply) : 'N/A'}</strong>
                                                    </li>
                                                    <li className="d-flex justify-content-between align-items-center mb-2">
                                                            <span><FontAwesomeIcon icon={faDollarSign}
                                                                                   className="me-2 text-success"/> Current Price:</span>
                                                        <strong>${formatNumber(calculationResult.crypto.currentPrice, 6)}</strong>
                                                    </li>
                                                    <li className="d-flex justify-content-between align-items-center">
                                                            <span><FontAwesomeIcon icon={faChartLine}
                                                                                   className="me-2 text-success"/> Market Cap:</span>
                                                        <strong>${formatNumber(calculationResult.crypto.marketCap)}</strong>
                                                    </li>
                                                </ul>
                                                <div className="text-center mt-3">
                                                    <Button
                                                        variant="success"
                                                        onClick={handleCoinGeckoClick}
                                                        className="details-button"
                                                    >
                                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="me-2"/>
                                                        {calculationResult.crypto.symbol.toUpperCase()} Details
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                                <NormalCard
                                    title={`Hypothetical ${censorTicker(calculationResult.krc20Token.tick)} Price`}
                                    titleProps={{className: "mt-4 text-center fw-bold"}}>
                                    <Card.Body className="text-center">
                                        <h5></h5>
                                        <p className="lead mb-3">
                                            {`If ${censorTicker(calculationResult.krc20Token.tick)} had ${calculationResult.crypto.symbol.toUpperCase()}'s
                                        market cap:`}
                                        </p>
                                        <h3 className="text-success price-highlight mb-3">
                                            <FontAwesomeIcon icon={faDollarSign} className="me-2"/>
                                            {formatNumber(calculationResult.calculatedPrice, 6)}
                                        </h3>
                                        <p className="text-muted disclaimer mb-0">
                                            <FontAwesomeIcon icon={faInfoCircle} className="me-2"/>
                                            This is a hypothetical price based on current market conditions and
                                            should not be considered as financial advice.
                                        </p>
                                    </Card.Body>
                                </NormalCard>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </Page>
    );
};

export default MarketCapCalculator;
