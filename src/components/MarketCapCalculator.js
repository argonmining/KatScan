import React, { useCallback, useEffect, useState } from 'react'
import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import AsyncSelect from 'react-select/async'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faChartLine,
    faCoins,
    faDollarSign,
    faExternalLinkAlt,
    faInfoCircle,
    faUsers,
} from '@fortawesome/free-solid-svg-icons'
import {
    getDetailedTokenInfo,
    getKRC20TokenList,
} from '../services/dataService'
import { getCryptoData, searchCryptos } from '../services/coingeckoService'
import '../styles/MarketCapCalculator.css'
import { censorTicker } from '../utils/censorTicker'
import SEO from './SEO'
import JsonLd from './JsonLd'
import { LoadingSpinner } from './LoadingSpinner'

const MarketCapCalculator = () => {
    const [krc20List, setKrc20List] = useState([])
    const [selectedKrc20Token, setSelectedKrc20Token] = useState(null)
    const [selectedCrypto, setSelectedCrypto] = useState(null)
    const [calculationResult, setCalculationResult] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [detailedTokenInfo, setDetailedTokenInfo] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        fetchKRC20Tokens()
    }, [])

    const fetchKRC20Tokens = async () => {
        try {
            const data = await getKRC20TokenList()
            const formattedList = data.result.map(token => ({
                value: token.tick,
                label: censorTicker(token.tick),
                ...token,
            }))
            setKrc20List(formattedList)
        } catch (error) {
            console.error('Error fetching KRC20 tokens:', error)
        }
    }

    const handleCryptoSearch = async inputValue => {
        if (inputValue.length > 1) {
            try {
                const results = await searchCryptos(inputValue)
                return results
            } catch (error) {
                console.error('Error searching cryptocurrencies:', error)
                return []
            }
        }
        return []
    }

    const fetchDetailedTokenInfo = useCallback(async tick => {
        try {
            const data = await getDetailedTokenInfo(tick)
            setDetailedTokenInfo(data)
        } catch (error) {
            console.error('Error fetching detailed token info:', error)
        }
    }, [])

    useEffect(() => {
        if (selectedKrc20Token) {
            fetchDetailedTokenInfo(selectedKrc20Token.tick)
        }
    }, [selectedKrc20Token, fetchDetailedTokenInfo])

    const calculateMarketCap = useCallback(async () => {
        if (selectedKrc20Token && selectedCrypto && detailedTokenInfo) {
            setIsLoading(true)
            setError(null)
            try {
                const cryptoData = await getCryptoData(selectedCrypto.value)
                const krc20Supply =
                    parseFloat(detailedTokenInfo.max) /
                    Math.pow(10, parseInt(detailedTokenInfo.dec || '0'))
                const cryptoMarketCap = cryptoData.market_data.market_cap.usd
                const calculatedPrice = cryptoMarketCap / krc20Supply

                setCalculationResult({
                    krc20Token: {
                        ...detailedTokenInfo,
                        holderTotal: detailedTokenInfo.holderTotal,
                    },
                    crypto: {
                        ...selectedCrypto,
                        ...cryptoData,
                        maxSupply: cryptoData.market_data.max_supply,
                        marketCap: cryptoMarketCap,
                        currentPrice: cryptoData.market_data.current_price.usd,
                    },
                    calculatedPrice,
                    krc20Supply,
                    cryptoMarketCap,
                })
            } catch (error) {
                console.error('Error calculating market cap:', error)
                setError('Failed to calculate market cap. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }
    }, [selectedKrc20Token, selectedCrypto, detailedTokenInfo])

    useEffect(() => {
        calculateMarketCap()
    }, [calculateMarketCap])

    const formatNumber = (num, decimals = 2) => {
        if (num === undefined || num === null || isNaN(num)) {
            return 'N/A'
        }
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(num)
    }

    const formatInteger = num => {
        if (num === undefined || num === null || isNaN(num)) {
            return 'N/A'
        }
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num)
    }

    const handleKRC20DetailClick = () => {
        if (calculationResult && calculationResult.krc20Token) {
            navigate(`/tokens/${calculationResult.krc20Token.tick}`)
        }
    }

    const handleCoinGeckoClick = () => {
        if (calculationResult && calculationResult.crypto) {
            window.open(
                `https://www.coingecko.com/en/coins/${calculationResult.crypto.id}`,
                '_blank',
            )
        }
    }

    return (
        <Container fluid className="market-cap-calculator">
            <SEO
                title="Market Cap Calculator"
                description="Calculate and compare market caps of KRC-20 tokens on the Kaspa network."
                keywords="KRC-20, Kaspa, market cap, calculator, cryptocurrency"
            />
            <JsonLd
                data={{
                    '@context': 'https://schema.org',
                    '@type': 'WebApplication',
                    name: 'KatScan Market Cap Calculator',
                    description:
                        'Calculate and compare market caps of KRC-20 tokens on the Kaspa network.',
                    url: 'https://katscan.xyz/marketcap-calc',
                }}
            />
            <h1 className="mb-4">MarketCap Calculator</h1>
            <Row className="justify-content-center">
                <Col md={10} lg={8}>
                    <Row className="mb-4">
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Select KRC20 Token</Form.Label>
                                <AsyncSelect
                                    cacheOptions
                                    defaultOptions={krc20List}
                                    loadOptions={inputValue =>
                                        Promise.resolve(
                                            krc20List.filter(option =>
                                                option.label
                                                    .toLowerCase()
                                                    .includes(
                                                        inputValue.toLowerCase(),
                                                    ),
                                            ),
                                        )
                                    }
                                    onChange={setSelectedKrc20Token}
                                    placeholder="Select KRC20 Token"
                                />
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
                    {isLoading && <LoadingSpinner />}
                    {error && (
                        <div className="alert alert-danger mt-4" role="alert">
                            {error}
                        </div>
                    )}
                    {calculationResult && (
                        <div className="calculation-result">
                            <h4 className="text-center mb-4">
                                Calculation Result
                            </h4>
                            <Row>
                                <Col md={6} className="mb-4">
                                    <Card className="h-100 token-card krc20-card">
                                        <Card.Body>
                                            <h5 className="text-center">
                                                {censorTicker(
                                                    calculationResult.krc20Token
                                                        .tick,
                                                )}{' '}
                                                (KRC20 Token)
                                            </h5>
                                            <ul className="list-unstyled">
                                                <li className="d-flex justify-content-between align-items-center mb-2">
                                                    <span>
                                                        <FontAwesomeIcon
                                                            icon={faCoins}
                                                            className="me-2 text-primary"
                                                        />{' '}
                                                        Max Supply:
                                                    </span>
                                                    <strong>
                                                        {formatNumber(
                                                            calculationResult.krc20Supply,
                                                        )}
                                                    </strong>
                                                </li>
                                                <li className="d-flex justify-content-between align-items-center mb-2">
                                                    <span>
                                                        <FontAwesomeIcon
                                                            icon={faUsers}
                                                            className="me-2 text-primary"
                                                        />{' '}
                                                        Total Holders:
                                                    </span>
                                                    <strong>
                                                        {formatInteger(
                                                            calculationResult
                                                                .krc20Token
                                                                .holderTotal,
                                                        )}
                                                    </strong>
                                                </li>
                                                <li className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <FontAwesomeIcon
                                                            icon={faChartLine}
                                                            className="me-2 text-primary"
                                                        />{' '}
                                                        Total Minted:
                                                    </span>
                                                    <strong>
                                                        {formatNumber(
                                                            parseFloat(
                                                                calculationResult
                                                                    .krc20Token
                                                                    .minted,
                                                            ) /
                                                                Math.pow(
                                                                    10,
                                                                    parseInt(
                                                                        calculationResult
                                                                            .krc20Token
                                                                            .dec ||
                                                                            '0',
                                                                    ),
                                                                ),
                                                        )}
                                                    </strong>
                                                </li>
                                            </ul>
                                            <div className="text-center mt-3">
                                                <Button
                                                    variant="primary"
                                                    onClick={
                                                        handleKRC20DetailClick
                                                    }
                                                    className="details-button"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faExternalLinkAlt}
                                                        className="me-2"
                                                    />
                                                    {censorTicker(
                                                        calculationResult
                                                            .krc20Token.tick,
                                                    )}{' '}
                                                    Details
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6} className="mb-4">
                                    <Card className="h-100 token-card coingecko-card">
                                        <Card.Body>
                                            <h5 className="text-center">
                                                {calculationResult.crypto.symbol.toUpperCase()}{' '}
                                                (CoinGecko)
                                            </h5>
                                            <ul className="list-unstyled">
                                                <li className="d-flex justify-content-between align-items-center mb-2">
                                                    <span>
                                                        <FontAwesomeIcon
                                                            icon={faCoins}
                                                            className="me-2 text-success"
                                                        />{' '}
                                                        Max Supply:
                                                    </span>
                                                    <strong>
                                                        {calculationResult
                                                            .crypto.maxSupply
                                                            ? formatNumber(
                                                                  calculationResult
                                                                      .crypto
                                                                      .maxSupply,
                                                              )
                                                            : 'N/A'}
                                                    </strong>
                                                </li>
                                                <li className="d-flex justify-content-between align-items-center mb-2">
                                                    <span>
                                                        <FontAwesomeIcon
                                                            icon={faDollarSign}
                                                            className="me-2 text-success"
                                                        />{' '}
                                                        Current Price:
                                                    </span>
                                                    <strong>
                                                        $
                                                        {formatNumber(
                                                            calculationResult
                                                                .crypto
                                                                .currentPrice,
                                                            6,
                                                        )}
                                                    </strong>
                                                </li>
                                                <li className="d-flex justify-content-between align-items-center">
                                                    <span>
                                                        <FontAwesomeIcon
                                                            icon={faChartLine}
                                                            className="me-2 text-success"
                                                        />{' '}
                                                        Market Cap:
                                                    </span>
                                                    <strong>
                                                        $
                                                        {formatNumber(
                                                            calculationResult
                                                                .crypto
                                                                .marketCap,
                                                        )}
                                                    </strong>
                                                </li>
                                            </ul>
                                            <div className="text-center mt-3">
                                                <Button
                                                    variant="success"
                                                    onClick={
                                                        handleCoinGeckoClick
                                                    }
                                                    className="details-button"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faExternalLinkAlt}
                                                        className="me-2"
                                                    />
                                                    {calculationResult.crypto.symbol.toUpperCase()}{' '}
                                                    Details
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            <Card className="mt-4 hypothetical-price-card">
                                <Card.Body className="text-center">
                                    <h5>
                                        Hypothetical{' '}
                                        {censorTicker(
                                            calculationResult.krc20Token.tick,
                                        )}{' '}
                                        Price
                                    </h5>
                                    <p className="lead mb-3">
                                        If{' '}
                                        {censorTicker(
                                            calculationResult.krc20Token.tick,
                                        )}{' '}
                                        had{' '}
                                        {calculationResult.crypto.symbol.toUpperCase()}
                                        's market cap:
                                    </p>
                                    <h3 className="text-success price-highlight mb-3">
                                        <FontAwesomeIcon
                                            icon={faDollarSign}
                                            className="me-2"
                                        />
                                        {formatNumber(
                                            calculationResult.calculatedPrice,
                                            6,
                                        )}
                                    </h3>
                                    <p className="text-muted disclaimer mb-0">
                                        <FontAwesomeIcon
                                            icon={faInfoCircle}
                                            className="me-2"
                                        />
                                        This is a hypothetical price based on
                                        current market conditions and should not
                                        be considered as financial advice.
                                    </p>
                                </Card.Body>
                            </Card>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    )
}

export default MarketCapCalculator
