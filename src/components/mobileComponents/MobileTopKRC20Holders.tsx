import React, {FC} from "react";
import {Link} from "react-router-dom";
import {Table} from "react-bootstrap";
import {censorTicker} from "../../utils/censorTicker";
import {ExpandableCard} from "nacho-component-library";

type InternalTopHolder = {
    address: string
    tokens: { tick: string, amount: number, decimals: number }[]
    uniqueTokens: number
}

type Props = {
    holders: InternalTopHolder[]
}

export const MobileTopKRC20Holders: FC<Props> = (
    {
        holders
    }
) => {
    const shortenAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-5)}`;
    };

    return <div className="mobile-holders-list">
        {holders.map((holder, index) => (
            <ExpandableCard key={holder.address} className="mb-3">
                <>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>Rank: {index + 1}</strong>
                        </div>
                        <div>
                            <Link to={`/wallet/${holder.address}`} className="clickable-address">
                                {shortenAddress(holder.address)}
                            </Link>
                        </div>
                    </div>
                    <div className="mt-2">
                        <strong>Unique Tokens:</strong> {holder.uniqueTokens}
                    </div>
                </>

                <Table size="sm" className="mt-2">
                    <thead>
                    <tr>
                        <th>Token</th>
                        <th>Amount</th>
                    </tr>
                    </thead>
                    <tbody>
                    {holder.tokens.map(token => (
                        <tr key={token.tick}>
                            <td>{censorTicker(token.tick)}</td>
                            <td>{token.amount.toLocaleString(undefined, {maximumFractionDigits: token.decimals})}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </ExpandableCard>
        ))}
    </div>
}