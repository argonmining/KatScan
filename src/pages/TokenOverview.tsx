import React, {FC, ReactElement, useMemo, useState} from 'react';
import 'styles/TokenOverview.css';
import {TokenData} from "../interfaces/TokenData";
import {
    CustomDropdown,
    CustomDropdownItem,
    Input,
    JsonLd,
    List,
    Page,
    SEO,
    SmallThumbnail,
    useMobile
} from "nacho-component-library";
import {Link} from "react-router-dom";
import {katscanStaticUrl} from "../utils/StaticVariables";
import {TokenActions} from "../components/TokenActions";
import {censorTicker} from "../utils/censorTicker";
import {formatNumber} from "../services/Helper";
import {useFetch} from "../hooks/useFetch";
import {cloneDeep} from "lodash";

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
    const [sortField, setSortField] = useState<keyof TokenData | ''>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [searchTerm, setSearchTerm] = useState('');
    const [launchTypeFilter, setLaunchTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const {data, loading} = useFetch<TokenData[]>({
        url: '/token/tokenlist'
    })

    const handleSort = (field: keyof TokenData): void => {
        if (field === sortField) {
            setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const handleLaunchTypeSelect = (eventKey: string): void => {
        setLaunchTypeFilter(eventKey);
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
        if (data.length === 0) {
            return []
        }
        let result = cloneDeep(data);

        // Filter by search term
        if (searchTerm) {
            result = result.filter(token =>
                token.tick.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by launch type
        if (launchTypeFilter) {
            result = result.filter(token =>
                (token.pre === 0 ? 'Fair Mint' : 'Pre-Mint') === launchTypeFilter
            );
        }

        // Filter by status
        if (statusFilter) {
            result = result.filter(token =>
                (token.state === 'finished' ? 'Complete' : 'Minting') === statusFilter
            );
        }

        // Sort
        if (sortField !== '') {
            result.sort((a, b) => {
                if (sortField === 'minted') {
                    const aPercentage = calculatePercentage(calculateValue(a.minted, a.dec), calculateValue(a.max, a.dec));
                    const bPercentage = calculatePercentage(calculateValue(b.minted, b.dec), calculateValue(b.max, b.dec));
                    if (aPercentage < bPercentage) return sortDirection === 'asc' ? -1 : 1;
                    if (aPercentage > bPercentage) return sortDirection === 'asc' ? 1 : -1;
                    return 0;
                } else {
                    if (!a[sortField] || !b[sortField]) {
                        return 0
                    }
                    if ((a[sortField] as number) < (b[sortField] as number)) {
                        return sortDirection === 'asc' ? -1 : 1
                    }
                    if ((a[sortField] as number) > (b[sortField] as number)) {
                        return sortDirection === 'asc' ? 1 : -1
                    }

                    return 0;
                }
            });
        }

        return result;
    }, [data, launchTypeFilter, searchTerm, sortDirection, sortField, statusFilter]);

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
        if (without) {
            return `${formattedPercentage}%`
        }
        return `(${formattedPercentage}%)`
    };

    const getBadgeClass = (preMint: number): string => {
        return preMint === 0 ? 'badge badge-fair-mint' : 'badge badge-pre-mint';
    };

    const formatPreMinted = (preMinted: number, max: number, decimals: number): string => {
        const value = calculateValue(preMinted, decimals);
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

    const getElement = (header: string, token: TokenData & { id?: string }): ReactElement | null => {

        const headerInternal = header as HeaderType;
        switch (headerInternal) {
            case "image":
                if (!token.logo) {
                    return null; // Return an empty div instead of null
                }
                return (
                    <div style={{width: '30px', overflow: 'hidden'}}>
                        <Link to={`/tokens/${token.tick}`} className="token-ticker">
                            <SmallThumbnail
                                src={`${katscanStaticUrl}/thumbnails${token.logo}`}
                                alt={token.tick}
                                loading="lazy"
                            />
                        </Link>
                    </div>
                );
            case "action":
                return <TokenActions tokenDetail={token}/>;
            case "tick":
                return (
                    <Link to={`/tokens/${token.tick}`} className="token-ticker">
                        {censorTicker(token.tick)}
                    </Link>
                );
            case "mintState":
                return (
                    <span className={getBadgeClass(token.pre)}>
                        {token.pre === 0 ? 'Fair Mint' : 'Pre-Mint'}
                    </span>
                );
            case "state":
                return <>{formatState(token.state)}</>;
            case 'max':
                return <>{formatNumberWithWords(token.max, token.dec)}</>;
            case 'pre':
                return <>{formatPreMinted(token.pre, token.max, token.dec)}</>;
            case 'minted':
                return <>{formatNumberWithWords(token.minted, token.dec)}</>;
            case 'mintProgress':
                return (
                    <>
                        <small className="text-muted">
                            {formatPercentage(calculateValue(token.minted, token.dec), calculateValue(token.max, token.dec), true)}
                        </small>
                        <div className="progress">
                            <div
                                className="progress-bar"
                                style={{width: `${calculatePercentage(calculateValue(token.minted, token.dec), calculateValue(token.max, token.dec))}%`}}
                            ></div>
                        </div>
                    </>
                );
            case 'mtsAdd':
                return <div>{formatDateTime(Number(token.mtsAdd))}</div>;
            default:
                return <div>{token[header as keyof TokenData]}</div>; // Ensure a ReactElement is always returned
        }
    };

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
                return <CustomDropdown title={'Launch Type'} theme={'header'}>
                    <CustomDropdownItem onClick={() => handleLaunchTypeSelect("")}>All</CustomDropdownItem>
                    <CustomDropdownItem onClick={() => handleLaunchTypeSelect("Fair Mint")}>Fair
                        Mint</CustomDropdownItem>
                    <CustomDropdownItem
                        onClick={() => handleLaunchTypeSelect("Pre-Mint")}>Pre-Mint</CustomDropdownItem>
                </CustomDropdown>
            case 'state':
                return <CustomDropdown title={'Status'} theme={'header'}>
                    <CustomDropdownItem onClick={() => handleStatusSelect("")}>All</CustomDropdownItem>
                    <CustomDropdownItem
                        onClick={() => handleStatusSelect("Complete")}>Complete</CustomDropdownItem>
                    <CustomDropdownItem onClick={() => handleStatusSelect("Minting")}>Minting</CustomDropdownItem>
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

    return (<Page header={'All KRC-20 Tokens'}
                  additionalHeaderComponent={
                      <Input customClass={'token-overview-search-form'}
                             placeholder={'Search by ticker...'}
                             onChangeCallback={setSearchTerm}
                             onSubmit={setSearchTerm}/>
                  }>
            <div className="token-overview">

                <List headerElements={header}
                      items={filteredAndSortedTokens}
                      itemHeight={40}
                      getHeader={getHeader}
                      getElement={getElement}
                      isLoading={loading}
                      cssGrid={true}
                      alternateIdKey={'tick'}
                />
                <JsonLd data={jsonLdData}/>
                <SEO
                    title="Token Overview"
                    description="Explore and analyze all KRC-20 tokens on the Kaspa blockchain."
                    keywords="KRC-20, Kaspa, token overview, cryptocurrency, blockchain"
                />
            </div>
        </Page>
    );
};

export default TokenOverview;