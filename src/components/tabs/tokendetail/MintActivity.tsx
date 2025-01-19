import React, {Dispatch, FC, SetStateAction, useEffect} from "react";

import {TokenData} from "../../../interfaces/TokenData";
import Chart from "react-apexcharts";
import {ApexOptions} from "apexcharts";
import {simpleRequest} from "nacho-component-library";

export type MintOvertimeType = {
    count: number
    date: string
}

type Props = {
    tokenData: TokenData
    mintActivityData: MintOvertimeType[]
    setMintActivityData: Dispatch<SetStateAction<MintOvertimeType[]>>
}

export const MintActivity: FC<Props> = (
    {
        tokenData,
        mintActivityData,
        setMintActivityData
    }
) => {

    useEffect(() => {
        if (!tokenData || mintActivityData.length !== 0) {
            return
        }

        simpleRequest<MintOvertimeType[]>(`https://katapi.nachowyborski.xyz/api/minting/mintsovertime?tick=${tokenData.tick.toUpperCase()}`)
            .then(data => {
                if (data.length === 0) {
                    return
                }
                const filledData = [];
                const startDate = new Date(data[data.length - 1].date);
                const endDate = new Date();
                const dateMap = new Map(data.map(item => [item.date, item.count]));

                // Add a date one day before the oldest record with a count of 0
                const preStartDate = new Date(startDate);
                preStartDate.setDate(preStartDate.getDate() - 1);
                filledData.push({date: preStartDate.toISOString().split('T')[0], count: 0});

                for (let d = startDate; d <= endDate; d.setDate(d.getDate() + 1)) {
                    const dateStr = d.toISOString().split('T')[0];
                    filledData.push({date: dateStr, count: dateMap.get(dateStr) || 0});
                }

                setMintActivityData(filledData)
            })
            .catch(error => {
                console.error('Failed to fetch mint activity data:', error);
            })
    }, [mintActivityData.length, setMintActivityData, tokenData]);

    //outside of component because its static
    const chartOptions: ApexOptions = {
        chart: {
            id: "mint-line",
            type: 'line',

        },
        stroke: {
            curve: "smooth"
        },
        title: {
            text: 'Daily Mint Activity'
        },
        legend: {
            position: 'top'
        },
        yaxis: {
            min: 0,

        }
    }

// options={{
//     responsive: true,
//         maintainAspectRatio: false,
//         plugins: {
//         legend: {
//             position: 'top',
//         },
//         title: {
//             display: true,
//                 text: 'Daily Mint Activity'
//         }
//     },
//     scales: {
//         y: {
//             beginAtZero: true
//         }
//     }
// }}

    const series: ApexAxisChartSeries = [{
        // datasets: [{

        // group: 'Daily Mints',
        color: 'rgb(40, 167, 69)',
        name: 'chart-1',
        type: 'line',

        // labels: mintActivity.map(item => item.date),
        data: mintActivityData.map(item => item.count)
    }]

    // data={{
//     labels: mintActivity.map(item => item?.date as ChartDatasetProperties<string, unknown>),
//         datasets: [{
//         label: 'Daily Mints',
//         data: mintActivity.map(item => item?.count as ChartDatasetProperties<string, unknown>),
//         borderColor: 'rgb(40, 167, 69)', // Green color
//         backgroundColor: 'rgba(40, 167, 69, 0.5)',
//     }]
// }}

    return <>
        <div className="chart-container">
            <Chart series={series}
                   type={'line'}
                   width={'100%'}
                   height={'400px'}
                   options={chartOptions}/>
        </div>
    </>
}