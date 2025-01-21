import React, {Dispatch, FC, ReactElement, SetStateAction, useEffect} from "react";
import {MobileHolderTable} from "../../tables/MobileHolderTable";
import {formatNumber, parseRawNumber} from "../../../services/Helper";
import {LinkWithTooltip, List, useMobile} from "nacho-component-library";
import {TokenData, TokenHolder} from "../../../interfaces/TokenData";
import 'styles/components/MobileTable.css'
import {useFetch} from "../../../hooks/useFetch";

type Props = {
    tokenData: TokenData
    holderData: TokenHolder[]
    setHolderData: Dispatch<SetStateAction<TokenHolder[]>>
}

export const TopHolder: FC<Props> = (
    {
        tokenData,
        holderData,
        setHolderData
    }
) => {

    const {isMobile} = useMobile()
    const {data, loading} = useFetch<TokenHolder[]>({
        url: `/token/holder/${tokenData.tick}`,
        avoidLoading: holderData?.length !== 0,
        defaultValue: holderData as never[]
    })

    useEffect(() => {
        if (data.length === 0){
            return
        }
        setHolderData(data)
    }, [data, setHolderData]);

    const getHeader = (header: string): ReactElement => {
        switch (header) {
            case 'balance':
                return <div>AMOUNT</div>
            default:
                return <div>{header.toUpperCase()}</div>
        }
    }
    const getElement = (header: string, item: TokenHolder, index: number): ReactElement => {
        switch (header) {
            case "rank":
                return <div>{index + 1}</div>
            case 'address':
                return <LinkWithTooltip
                    to={`/wallet/${item.address}`}
                    tooltip="View wallet details"
                    className="clickable-address">
                    {item.address}
                </LinkWithTooltip>
            case 'balance':
                return <div>{formatNumber(parseRawNumber(item.balance, tokenData.dec), tokenData.dec)}</div>
            case '% of Total Supply':
                return <div>{((parseRawNumber(item.balance, tokenData.dec) / parseRawNumber(tokenData.max, tokenData.dec)) * 100).toFixed(2)}%</div>
            default:
                return <div>{item[header as keyof TokenHolder]}</div>
        }
    }
    return <>
        <div className="detail-table-container">
            {isMobile ? (
                <MobileHolderTable
                    data={holderData}
                    tokenData={tokenData}
                />
            ) : (
                <List isLoading={loading}
                      headerElements={['rank', 'address', 'balance', '% of Total Supply']}
                      gridTemplate={'0.5fr 4fr 2fr 1fr'}
                      getHeader={getHeader}
                      minItemHeight={30}
                      getElement={getElement}
                      items={data}/>
            )}
        </div>
        <p className="mt-3 text-muted">
            Note: Only top holders are displayed. The total number of holders
            is {formatNumber(tokenData.holderTotal, 0)}.
        </p>
    </>
}