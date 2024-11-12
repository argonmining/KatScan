import React, {FC} from 'react';
import 'styles/components/DivChart.css'

type Props = {
    data: { label: string, percentage: number }[]
    groupLabel:string
}
export const DivChart: FC<Props> = (
    {
        data,
        groupLabel
    }
) => {
    return <div className="div-chart">
        <table className="table table-striped">
            <thead>
            <tr>
                <th>{groupLabel}</th>
                <th>Percentage</th>
            </tr>
            </thead>
            <tbody>
            {data.map((item, index) => (
                <tr key={index} style={{position: 'relative'}}>
                    <td>{item.label}</td>
                    <td>{item.percentage.toFixed(2)}%</td>
                    <div style={{
                        left: 0,
                        top: 0,
                        height: '100%',
                        position: 'absolute',
                        padding:0,
                        width: `${Number(item.percentage)}%`
                    }}
                    className={"chart-overlay"}/>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
}