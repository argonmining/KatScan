import React, {FC} from "react";
import {TokenSearchResult} from "../../interfaces/TokenData";
import {OpTransactionData} from "../../interfaces/OpTransactionData";
import {LinkWithTooltip} from "../LinkWithTooltip";

type MobileOperationsTable = {
    data: OpTransactionData[];
    tokenData: TokenSearchResult;
    handleAddressClick: (address: string) => void;
    formatNumber: (rawNumber: number, decimals: number) => string;
    parseRawNumber: (rawNumber: string, decimals: number) => number;
    shortenString: (str: string, startLength?: number, endLength?: number) => string
    handleTransactionClick: (value: string) => void
    formatDateTime: (value: string) => string
}
// todo
// handleAddressClick,
// handleTransactionClick,
// is unused
export const MobileOperationsTable: FC<MobileOperationsTable> = (
    {
        data,
        tokenData,
        formatNumber,
        parseRawNumber,
        formatDateTime,
        shortenString
    }
) => {
    return <div className="mobile-table">
        {data.map((item, index) => (
            <div key={index} className="mobile-table-row">
                <div className="mobile-table-cell">
                    <strong>Type:</strong> {item.op}
                </div>
                <div className="mobile-table-cell">
                    <strong>Transaction ID:</strong>
                    <LinkWithTooltip
                        to={`/transaction-lookup/${item.hashRev}`}
                        tooltip="View transaction details"
                        className="clickable-address"
                    >
                        {shortenString(item.hashRev)}
                    </LinkWithTooltip>
                </div>
                <div className="mobile-table-cell">
                    <strong>Address:</strong>
                    <LinkWithTooltip
                        to={`/wallet/${item.op === 'mint' ? item.to : item.from}`}
                        tooltip="View wallet details"
                        className="clickable-address"
                    >
                        {shortenString(item.op === 'mint' ? item.to : item.from)}
                    </LinkWithTooltip>
                </div>
                <div className="mobile-table-cell">
                    <strong>Amount:</strong> {formatNumber(parseRawNumber(item.amt, tokenData.dec), tokenData.dec)}
                </div>
                <div className="mobile-table-cell">
                    <strong>Timestamp:</strong> {formatDateTime(item.mtsAdd)}
                </div>
            </div>
        ))}
    </div>
}