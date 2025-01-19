import React, {FC} from "react";
import {TokenData, TokenHolder} from "../../interfaces/TokenData";
import {LinkWithTooltip} from "nacho-component-library";
import {formatNumber, parseRawNumber, shortenString} from "../../services/Helper";
import 'styles/components/MobileTable.css'

type MobileHolderTable = {
    data: TokenHolder[];
    tokenData: TokenData;
}

export const MobileHolderTable: FC<MobileHolderTable> = (
    {
        data,
        tokenData,
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
                        <strong>Amount:</strong> {formatNumber(parseRawNumber(item.balance, tokenData.dec), tokenData.dec)}
                    </div>
                    <div className="mobile-table-cell">
                        <strong>% of Total Supply:</strong>
                        {((parseRawNumber(item.balance, tokenData.dec) / parseRawNumber(tokenData.max, tokenData.dec)) * 100).toFixed(2)}%
                    </div>
                </>
            </div>
        ))}
    </div>
}