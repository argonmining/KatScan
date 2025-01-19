import React, {FC, useMemo} from "react";
import {parseRawNumber} from "../../../services/Helper";
import {TokenData, TokenHolder} from "../../../interfaces/TokenData";
import 'styles/tokendetail/HolderDistribution.css'
import {DivChart} from "nacho-component-library";

type Props = {
    tokenData: TokenData | null
    tokenHolder: TokenHolder[]
}

export const HolderDistribution: FC<Props> = (
    {
        tokenData,
        tokenHolder
    }
) => {
    const holderDistribution = useMemo(() => {
        if (tokenData === null) {
            return []
        }

        if (tokenHolder.length === 0) {
            return [
                {
                    label: 'Other Holders',
                    percentage: 100,
                }
            ];
        }
        const holders = tokenHolder
        const decimals = tokenData.dec
        const maxSupply = tokenData.max

        const groups = [
            {label: 'Top 1-10 Holders', total: 0},
            {label: 'Top 11-20 Holders', total: 0},
            {label: 'Top 21-30 Holders', total: 0},
            {label: 'Top 31-40 Holders', total: 0},
            {label: 'Top 41-50 Holders', total: 0},
        ];

        holders.slice(0, 50).forEach((holder, index) => {
            const groupIndex = Math.floor(index / 10);
            groups[groupIndex].total += parseRawNumber(holder.balance, decimals);
        });

        const top50Total = groups.reduce((sum, group) => sum + group.total, 0);
        const otherHoldersTotal = parseRawNumber(maxSupply.toString(), decimals) - top50Total;

        return [
            ...groups.map(group => ({
                label: group.label,
                percentage: (group.total / parseRawNumber(maxSupply.toString(), decimals)) * 100,
            })),
            {
                label: 'Other Holders',
                percentage: (otherHoldersTotal / parseRawNumber(maxSupply.toString(), decimals)) * 100,
            }
        ];
    }, [tokenData, tokenHolder]);

    return <div className="holder-distribution">
        <DivChart data={holderDistribution} groupLabel={'Holder Group'}/>
    </div>
}