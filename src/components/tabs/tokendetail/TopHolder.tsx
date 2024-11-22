import React, {FC} from "react";
import {MobileHolderTable} from "../../tables/MobileHolderTable";
import {formatNumber, parseRawNumber} from "../../../services/Helper";
import {Table} from "react-bootstrap";
import {LinkWithTooltip, useMobile} from "nacho-component-library";
import {TokenSearchResult} from "../../../interfaces/TokenData";
import 'styles/components/MobileTable.css'

type Props = {
    tokenData: TokenSearchResult
}

export const TopHolder: FC<Props> = (
    {
        tokenData
    }
) => {

    const {isMobile} = useMobile()

    return <>
        <div className="detail-table-container">
            {isMobile ? (
                <MobileHolderTable
                    data={tokenData.holder}
                    tokenData={tokenData}
                />
            ) : (
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Address</th>
                        <th>Amount</th>
                        <th>% of Total Supply</th>
                    </tr>
                    </thead>
                    <tbody style={{position: 'relative'}}>
                    {tokenData.holder && tokenData.holder.map((holder, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>
                                <LinkWithTooltip
                                    to={`/wallet/${holder.address}`}
                                    tooltip="View wallet details"
                                    className="clickable-address"
                                >
                                    {holder.address}
                                </LinkWithTooltip>
                            </td>
                            <td>{formatNumber(parseRawNumber(holder.amount, tokenData.dec), tokenData.dec)}</td>
                            <td>
                                {((parseRawNumber(holder.amount, tokenData.dec) / parseRawNumber(tokenData.max, tokenData.dec)) * 100).toFixed(2)}%
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </div>
        <p className="mt-3 text-muted">
            Note: Only top holders are displayed. The total number of holders
            is {formatNumber(tokenData.holderTotal, 0)}.
        </p>
    </>
}