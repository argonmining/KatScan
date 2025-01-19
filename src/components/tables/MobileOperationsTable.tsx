import React, {FC} from "react";
import {TokenData} from "../../interfaces/TokenData";
import {OpTransactionData} from "../../interfaces/OpTransactionData";
import {LinkWithTooltip} from "nacho-component-library";
import {formatDateTime, formatNumber, parseRawNumber, shortenString} from "../../services/Helper";
import 'styles/components/MobileTable.css'

type MobileOperationsTable = {
    data: OpTransactionData[]
    tokenData: TokenData
}
export const MobileOperationsTable: FC<MobileOperationsTable> = (
    {
        data,
        tokenData
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