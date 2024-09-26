import React, {FC, useMemo} from "react";
import Chart from "react-apexcharts";
import {ApexOptions} from "apexcharts";
import {formatNumber, parseRawNumber} from "../../../services/Helper";
import {TokenSearchResult} from "../../../interfaces/TokenData";
import {useMobile} from "../../../hooks/mobile";

type Props = {
    tokenData: TokenSearchResult | null
}

export const HolderDistribution: FC<Props> = (
    {
        tokenData
    }
) => {
    const {isMobile} = useMobile()

    const holderDistribution = useMemo(() => {
        if (tokenData === null) {
            return []
        }

        if (tokenData.holder.length === 0) {
            return [
                {
                    label: 'Other Holders',
                    percentage: 100,
                }
            ];
        }
        const holders = tokenData.holder
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
            groups[groupIndex].total += parseRawNumber(holder.amount.toString(), decimals);
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
    }, [tokenData]);

    const testOptions: ApexOptions = {
        chart: {
            id: "basic-pie",
            type: 'pie',

        },
        tooltip: {
            enabled: true
        },
        colors: [
            'rgba(255,99,132,0.5)',
            'rgba(54,162,235,0.5)',
            'rgba(255,206,86,0.5)',
            'rgba(75,192,192,0.5)',
            'rgba(153,102,255,0.5)',
            'rgba(201,203,207,0.5)',
        ],
        legend: {
            labels: {
                useSeriesColors: true
            },
            fontSize: '20px',
            onItemHover: {
                highlightDataSeries: false
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function (val: number) {
                return formatNumber(val, 2) + "%"
            },

        },
        labels: holderDistribution.map(item => item.label),
    }
    const testSeries = holderDistribution.map(item => item.percentage)
    return <div className="chart-container">
        {isMobile ? (
            <div className="mobile-holder-distribution">
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Holder Group</th>
                        <th>Percentage</th>
                    </tr>
                    </thead>
                    <tbody>
                    {holderDistribution.map((item, index) => (
                        <tr key={index}>
                            <td>{item.label}</td>
                            <td>{item.percentage.toFixed(2)}%</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <Chart type={'pie'} options={testOptions} series={testSeries} width={'50%'} height={400}/>
        )}
    </div>
}