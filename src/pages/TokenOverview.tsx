import React, {FC, ReactElement, useEffect, useMemo, useRef, useState} from 'react';
import {getKRC20TokenListSequential} from '../services/dataService';
import 'styles/TokenOverview.css';
import {TokenData} from "../interfaces/TokenData";
import {Input, JsonLd, SEO, SmallThumbnail, CustomDropdown, List, useMobile} from "nacho-component-library";
import {Link} from "react-router-dom";
import {iconBaseUrl} from "../utils/StaticVariables";
import {TokenActions} from "../components/TokenActions";
import {censorTicker} from "../utils/censorTicker";
import {generateUniqueID} from "web-vitals/dist/modules/lib/generateUniqueID";
import {Dropdown} from "react-bootstrap";
import {formatNumber} from "../services/Helper";

const ITEMS_PER_PAGE = 50;

const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "KRC-20 Tokens Overview | KatScan",
    "description": "Overview of all KRC-20 tokens on the Kaspa blockchain.",
    "url": "https://katscan.xyz/tokens",
};
type HeaderType = (keyof TokenData | 'image' | 'action' | 'mintState' | 'mintProgress')

const header: HeaderType[] = ['image', 'action', 'tick', 'mintState', 'state', 'max', 'pre', 'minted', 'mintProgress', 'mtsAdd']

const TokenOverview: FC = () => {
    const {isMobile} = useMobile()
    const [tokens, setTokens] = useState<(TokenData & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortField, setSortField] = useState<keyof TokenData | ''>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState('');
    const [launchTypeFilter, setLaunchTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [cursor, setCursor] = useState<null | number>(null)
    const [isFinished, setIsFinished] = useState<boolean>(false)
    const loadingRef = useRef<number | null>()

    useEffect(() => {
        let isMounted = true;

        if (isFinished || loadingRef.current === cursor) {
            return;
        }

        const fetchAllTokens = async (): Promise<void> => {
            try {
                setLoading(true);
                loadingRef.current = cursor;
                const data = await getKRC20TokenListSequential(ITEMS_PER_PAGE, sortField, sortDirection, cursor);
                if (loadingRef.current !== cursor) {
                    return;
                }
                const tempRes = data.result.map(single => ({...single, id: generateUniqueID()}))
                setTokens(current => ([...current, ...tempRes]));

                if (data.cursor === undefined) {
                    setIsFinished(true);
                    setLoading(false);
                    return;
                }
                setCursor(data.cursor);
            } catch (err) {
                console.error('Error in TokenOverview:', err);
                if (isMounted) {
                    setError(`Failed to fetch tokens: ${(err as Record<string, string>).message}`);
                    setLoading(false);
                }
            }
        };
        void fetchAllTokens();

        return () => {
            isMounted = false;
        };
    }, [sortField, sortDirection, cursor, isFinished]);

    const resetAll = () => {
        setTokens([])
        setCursor(null)
        setIsFinished(false)
        loadingRef.current = undefined
    }

    const handleSort = (field: keyof TokenData): void => {
        if (field === sortField) {
            setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        resetAll()
    };

    const handleLaunchTypeSelect = (eventKey: string): void => {
        setLaunchTypeFilter(eventKey);
        resetAll()
    };

    const handleStatusSelect = (eventKey: string): void => {
        setStatusFilter(eventKey);
    };

    const calculateValue = (value: number, decimals: number): number => {
        return value / Math.pow(10, decimals);
    };

    const calculatePercentage = (part: number, whole: number): number => {
        return (part / whole) * 100;
    };

    const filteredAndSortedTokens = useMemo(() => {
        let result = tokens;

        // Filter by search term
        if (searchTerm) {
            result = result.filter(token =>
                token.tick.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by launch type
        if (launchTypeFilter) {
            result = result.filter(token =>
                (token.pre === '0' ? 'Fair Mint' : 'Pre-Mint') === launchTypeFilter
            );
        }

        // Filter by status
        if (statusFilter) {
            result = result.filter(token =>
                (token.state === 'finished' ? 'Complete' : 'Minting') === statusFilter
            );
        }

        // Sort
        if (sortField) {
            result.sort((a, b) => {
                if (sortField === 'minted') {
                    const aPercentage = calculatePercentage(calculateValue(a.minted, a.dec), calculateValue(a.max, a.dec));
                    const bPercentage = calculatePercentage(calculateValue(b.minted, b.dec), calculateValue(b.max, b.dec));
                    if (aPercentage < bPercentage) return sortDirection === 'asc' ? -1 : 1;
                    if (aPercentage > bPercentage) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                } else {
                    if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
                    if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                }
            });
        }

        return result;
    }, [tokens, searchTerm, sortField, sortDirection, launchTypeFilter, statusFilter]);

    const formatState = (state: string): string => {
        return state === 'finished' ? 'Complete' : 'Minting';
    };

    const formatDateTime = (timestamp: number): string => {
        return new Date(parseInt(String(timestamp))).toLocaleString('en-US', {
            year: '2-digit',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short'
        });
    };

    const formatPercentage = (value: number, max: number, without?: boolean): string => {
        const percentage = (value / max) * 100;
        const formattedPercentage = percentage < 1 && percentage > 0 ? '<1' : Math.round(percentage);
        if (without){
            return `${formattedPercentage}%`
        }
        return `(${formattedPercentage}%)`
    };

    const getBadgeClass = (preMint: string): string => {
        return preMint === '0' ? 'badge badge-fair-mint' : 'badge badge-pre-mint';
    };

    const formatPreMinted = (preMinted: string, max: number, decimals: number): string => {
        const value = calculateValue(parseInt(preMinted), decimals);
        if (value === 0) return "None";
        return `${formatNumber(value)} ${formatPercentage(value, calculateValue(max, decimals))}`;
    };

    const formatLargeNumber = (value: number): string => {
        const units = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion", "Undecillion", "Duodecillion", "Tredecillion", "Quattuordecillion", "Quindecillion", "Sexdecillion", "Septendecillion", "Octodecillion", "Novemdecillion", "Vigintillion"];
        let unitIndex = 0;
        let num = value;

        while (num >= 1000 && unitIndex < units.length - 1) {
            num /= 1000;
            unitIndex++;
        }

        return `${num.toFixed(2)} ${units[unitIndex]}`.trim();
    };

    const formatNumberWithWords = (value: number, decimals: number): string => {
        const integerPart = Math.floor(value / Math.pow(10, decimals));
        if (integerPart.toString().length >= (isMobile ? 5 : 14)) {
            return formatLargeNumber(integerPart);
        }
        return formatNumber(value / Math.pow(10, decimals));
    };

    if (error) return <div className="token-overview error">Error: {error}</div>;

    const getElement = (header: string, token: TokenData): ReactElement => {
        const headerInternal = header as HeaderType
        switch (headerInternal) {
            case "image":
                return <div style={{width: '30px', overflow: 'hidden'}}>
                    <Link to={`/tokens/${token.tick}`} className="token-ticker">
                        <SmallThumbnail src={`${iconBaseUrl}${token.tick}.jpg`}
                                        alt={token.tick}
                                        loading="lazy"/>
                    </Link>
                </div>
            case "action":
                return <TokenActions tokenDetail={token}/>
            case "tick":
                return <Link to={`/tokens/${token.tick}`} className="token-ticker">
                    {censorTicker(token.tick)}
                </Link>
            case "mintState":
                return <span className={getBadgeClass(token.pre)}>
                     {token.pre === '0' ? 'Fair Mint' : 'Pre-Mint'}
                            </span>

            case "state":
                return <>{formatState(token.state)}</>
            case 'max':
                return <>{formatNumberWithWords(token.max, token.dec)}</>
            case 'pre':
                return <>{formatPreMinted(token.pre, token.max, token.dec)}</>
            case 'minted':
                return <>{formatNumberWithWords(token.minted, token.dec)}
                </>
            case 'mintProgress':
                return <>
                    <small className="text-muted">
                        {formatPercentage(calculateValue(token.minted, token.dec), calculateValue(token.max, token.dec), true)}
                    </small>
                    <div className="progress">
                        <div className="progress-bar"
                             style={{width: `${calculatePercentage(calculateValue(token.minted, token.dec), calculateValue(token.max, token.dec))}%`}}
                        ></div>
                    </div>
                </>
            case 'mtsAdd':
                return <div>{formatDateTime(token.mtsAdd)}</div>
            default:
                return <div>{token[header as keyof TokenData]}</div>
        }
    }
    const getHeader = (value: string): ReactElement | null => {
        const h = value as HeaderType
        switch (h) {
            case 'image':
            case "action":
                return null
            case 'tick':
                return <div className="sticky-column cursor"
                            onClick={() => handleSort('tick')}>
                    Ticker {sortField === 'tick' && (sortDirection === 'asc' ? '▲' : '▼')}
                </div>
            case 'mintState':
                return <CustomDropdown title={'Launch Type'}>
                    <Dropdown.Item onClick={() => handleLaunchTypeSelect("")}>All</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleLaunchTypeSelect("Fair Mint")}>Fair
                        Mint</Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => handleLaunchTypeSelect("Pre-Mint")}>Pre-Mint</Dropdown.Item>
                </CustomDropdown>
            case 'state':
                return <CustomDropdown title={'Status'}>
                    <Dropdown.Item onClick={() => handleStatusSelect("")}>All</Dropdown.Item>
                    <Dropdown.Item
                        onClick={() => handleStatusSelect("Complete")}>Complete</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStatusSelect("Minting")}>Minting</Dropdown.Item>
                </CustomDropdown>
            case 'max':
                return <div onClick={() => handleSort('max')}
                            className={'cursor'}>
                    Max Supply {sortField === 'max' && (sortDirection === 'asc' ? '▲' : '▼')}
                </div>
            case 'pre':
                return <div onClick={() => handleSort('pre')}
                            className={'cursor'}>
                    Pre-Minted {sortField === 'pre' && (sortDirection === 'asc' ? '▲' : '▼')}
                </div>
            case 'minted':
                return <div onClick={() => handleSort('minted')}
                            className={'cursor'}>
                    Total Minted {sortField === 'minted' && (sortDirection === 'asc' ? '▲' : '▼')}
                </div>
            case 'mintProgress':
                return <div className="text-center">Minting Progress</div>
            case 'mtsAdd':
                return <div onClick={() => handleSort('mtsAdd')}
                            className={'cursor'}>
                    Deployed On {sortField === 'mtsAdd' && (sortDirection === 'asc' ? '▲' : '▼')}
                </div>
            default:
                return <div>{value}</div>
        }
    }

    return (
        <div className="token-overview">
            <div className="token-overview-header">
                <h2>All KRC-20 Tokens</h2>
                <Input customClass={'search-form'}
                       placeholder={'Search by ticker...'}
                       onChangeCallback={setSearchTerm}
                       onSubmit={setSearchTerm}/>
            </div>
            <List headerElements={header}
                  items={filteredAndSortedTokens}
                  itemHeight={40}
                  getHeader={getHeader}
                  getElement={getElement}
                  isLoading={loading}
                  cssGrid={true}
            />
            <JsonLd data={jsonLdData}/>
            <SEO
                title="Token Overview"
                description="Explore and analyze all KRC-20 tokens on the Kaspa blockchain."
                keywords="KRC-20, Kaspa, token overview, cryptocurrency, blockchain"
            />
        </div>
    );
};

export default TokenOverview;