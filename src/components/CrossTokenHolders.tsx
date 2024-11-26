import React, {useState, useEffect, FC} from 'react';
import {Bar} from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';
import {getKRC20TokenList} from '../services/dataService';
import 'styles/CrossTokenHolders.css';
import {JsonLd, SEO} from "nacho-component-library";

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
type ChartType = {
    labels: string[]
    datasets: {
        data: any[]
        label: string
        backgroundColor: string
        borderColor: string
        borderWidth: number
    }[]
}
const CrossTokenHolders: FC = () => {
        const [chartData, setChartData] = useState<ChartType>({
            labels: [],
            datasets: [{
                label: 'Number of Holders',
                data: [],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        });

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const tokenList = (await getKRC20TokenList()).result;
                    const labels = tokenList.slice(0, 3).map(token => token.tick);
                    //todo holders_count not in data
                    // const data = tokenList.slice(0, 3).map(token => token.holders_count);
                    const data:ChartType['datasets'] = []

                    setChartData(prevState => ({
                        ...prevState,
                        labels,
                        datasets: [{
                            ...prevState.datasets[0],
                            data,
                        }],
                    }));
                } catch (error) {
                    console.error('Error fetching token data:', error);
                }
            };

            void fetchData();
        }, []);

        //todo chart
        return (
            <div className="cross-token-holders">
                <h3>Cross-Token Holders Analysis</h3>
                <SEO
                    title="Cross-Token Holders Analysis"
                    description="Analyze and compare holder distributions across different KRC-20 tokens on the Kaspa blockchain."
                    keywords="KRC-20, Kaspa, token holders, cross-token analysis, comparison"
                />
                <JsonLd
                    data={{
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": "KatScan Cross-Token Holders Analysis",
                        "description": "Analyze and compare holder distributions across different KRC-20 tokens on the Kaspa blockchain.",
                        "url": "https://katscan.xyz/cross-token-holders"
                    }}
                />
                <Bar data={chartData}/>
            </div>
        );
    }
;

export default CrossTokenHolders;
