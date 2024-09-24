import React, {FC} from "react";
import {TokenSearchResult} from "../../interfaces/TokenData";
import {LinkWithTooltip} from "../LinkWithTooltip";

type MobileHolderTable = {
    data: TokenSearchResult['holder'];
    tokenData: TokenSearchResult;
    formatNumber: (rawNumber: number, decimals: number) => string;
    parseRawNumber: (rawNumber: number, decimals: number) => number;
    shortenString: (str: string, startLength?: number, endLength?: number) => string
}

export const MobileHolderTable: FC<MobileHolderTable> = (
    {
        data,
        tokenData,
        formatNumber,
        parseRawNumber,
        shortenString
    }
) => {
    return <div className="mobile-table">
        {data.map((item, index) => (
            <div key={index} className="mobile-table-row">
                <>
                    <div className="mobile-table-cell">
                        <strong>Rank:</strong> {index + 1}
                    </div>
                    <div className="mobile-table-cell">
                        <strong>Address:</strong>
                        <LinkWithTooltip
                            to={`/wallet/${item.address}`}
                            tooltip="View wallet details"
                            className="clickable-address"
                        >
                            {shortenString(item.address)}
                        </LinkWithTooltip>
                    </div>
                    <div className="mobile-table-cell">
                        <strong>Amount:</strong> {formatNumber(parseRawNumber(item.amount, tokenData.dec), tokenData.dec)}
                    </div>
                    <div className="mobile-table-cell">
                        <strong>% of Total Supply:</strong>
                        {((parseRawNumber(item.amount, tokenData.dec) / parseRawNumber(tokenData.max, tokenData.dec)) * 100).toFixed(2)}%
                    </div>
                </>
            </div>
        ))}
    </div>
}