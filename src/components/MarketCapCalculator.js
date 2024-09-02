import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Card, Spinner } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faExchangeAlt, faDollarSign, faChartLine, faVolumeUp, faUsers } from '@fortawesome/free-solid-svg-icons';
import { getKRC20TokenList, getDetailedTokenInfo } from '../services/dataService';
import { searchCryptos, getCryptoData } from '../services/coingeckoService';
import '../styles/MarketCapCalculator.css';

const MarketCapCalculator = () => {
  const [krc20List, setKrc20List] = useState([]);
  const [selectedKrc20Token, setSelectedKrc20Token] = useState(null);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [calculationResult, setCalculationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [detailedTokenInfo, setDetailedTokenInfo] = useState(null);

  useEffect(() => {
    fetchKRC20Tokens();
  }, []);

  const fetchKRC20Tokens = async () => {
    try {
      const data = await getKRC20TokenList();
      const formattedList = data.result.map(token => ({
        value: token.tick,
        label: token.tick,
        ...token
      }));
      setKrc20List(formattedList);
    } catch (error) {
      console.error('Error fetching KRC20 tokens:', error);
    }
  };

  const handleCryptoSearch = async (inputValue) => {
    if (inputValue.length > 1) {
      try {
        const results = await searchCryptos(inputValue);
        return results;
      } catch (error) {
        console.error('Error searching cryptocurrencies:', error);
        return [];
      }
    }
    return [];
  };

  const fetchDetailedTokenInfo = useCallback(async (tick) => {
    try {
      const data = await getDetailedTokenInfo(tick);
      setDetailedTokenInfo(data);
    } catch (error) {
      console.error('Error fetching detailed token info:', error);
    }
  }, []);

  useEffect(() => {
    if (selectedKrc20Token) {
      fetchDetailedTokenInfo(selectedKrc20Token.tick);
    }
  }, [selectedKrc20Token, fetchDetailedTokenInfo]);

  const calculateMarketCap = useCallback(async () => {
    if (selectedKrc20Token && selectedCrypto && detailedTokenInfo) {
      setIsLoading(true);
      setError(null);
      try {
        const cryptoData = await getCryptoData(selectedCrypto.value);
        const krc20Supply = parseFloat(detailedTokenInfo.max) / Math.pow(10, parseInt(detailedTokenInfo.dec || '0'));
        const cryptoMarketCap = cryptoData.market_data.market_cap.usd;
        const calculatedPrice = cryptoMarketCap / krc20Supply;

        setCalculationResult({
          krc20Token: detailedTokenInfo,
          crypto: {
            ...selectedCrypto,
            ...cryptoData
          },
          calculatedPrice,
          krc20Supply,
          cryptoMarketCap
        });
      } catch (error) {
        console.error('Error calculating market cap:', error);
        setError('Failed to calculate market cap. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [selectedKrc20Token, selectedCrypto, detailedTokenInfo]);

  useEffect(() => {
    calculateMarketCap();
  }, [calculateMarketCap]);

  const formatNumber = (num) => {
    if (num === undefined || num === null || isNaN(num)) {
      return 'N/A';
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <Container className="market-cap-calculator">
      <h2 className="text-center mb-4">
        <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
        MarketCap Calculator
      </h2>
      <Row className="mb-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Select KRC20 Token</Form.Label>
            <AsyncSelect
              cacheOptions
              defaultOptions={krc20List}
              loadOptions={(inputValue) => Promise.resolve(krc20List.filter(option => 
                option.label.toLowerCase().includes(inputValue.toLowerCase())
              ))}
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
              placeholder="Search for a cryptocurrency"
            />
          </Form.Group>
        </Col>
      </Row>
      {isLoading && (
        <div className="text-center mt-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      {error && (
        <div className="alert alert-danger mt-4" role="alert">
          {error}
        </div>
      )}
      {calculationResult && (
        <Card className="mt-4 result-card">
          <Card.Body>
            <h4 className="text-center mb-4">Calculation Result</h4>
            <Row>
              <Col md={6}>
                <h5 className="text-center">{calculationResult.krc20Token.tick} (KRC20 Token)</h5>
                <p className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
                  <span><strong>Max Supply:</strong> {formatNumber(calculationResult.krc20Supply)}</span>
                </p>
                <p className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faUsers} className="me-2 text-primary" />
                  <span><strong>Total Holders:</strong> {formatNumber(calculationResult.krc20Token.holders)}</span>
                </p>
                <p className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faVolumeUp} className="me-2 text-primary" />
                  <span><strong>Total Minted:</strong> {formatNumber(parseFloat(calculationResult.krc20Token.minted) / Math.pow(10, parseInt(calculationResult.krc20Token.dec || '0')))}</span>
                </p>
              </Col>
              <Col md={6}>
                <h5 className="text-center">{calculationResult.crypto.symbol.toUpperCase()} (CoinGecko)</h5>
                <p className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faDollarSign} className="me-2 text-success" />
                  <span><strong>Current Price:</strong> ${calculationResult.crypto.market_data.current_price.usd.toFixed(6)}</span>
                </p>
                <p className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faChartLine} className="me-2 text-success" />
                  <span><strong>Market Cap:</strong> ${formatNumber(calculationResult.cryptoMarketCap)}</span>
                </p>
                <p className="d-flex align-items-center">
                  <FontAwesomeIcon icon={faVolumeUp} className="me-2 text-success" />
                  <span><strong>24h Volume:</strong> ${formatNumber(calculationResult.crypto.market_data.total_volume.usd)}</span>
                </p>
              </Col>
            </Row>
            <hr />
            <div className="text-center hypothetical-price">
              <h5>Hypothetical {calculationResult.krc20Token.tick} Price</h5>
              <p className="lead">
                If {calculationResult.krc20Token.tick} had {calculationResult.crypto.symbol.toUpperCase()}'s market cap:
              </p>
              <h3 className="text-success price-highlight">
                <FontAwesomeIcon icon={faDollarSign} className="me-2" />
                {formatNumber(calculationResult.calculatedPrice)}
              </h3>
              <p className="text-muted disclaimer">
                <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                This is a hypothetical price based on current market conditions and should not be considered as financial advice.
              </p>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MarketCapCalculator;
