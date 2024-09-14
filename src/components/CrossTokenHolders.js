import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getKRC20TokenList } from '../services/dataService';
import '../styles/CrossTokenHolders.css';
import SEO from './SEO';
import JsonLd from './JsonLd';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CrossTokenHolders = () => {
  const [chartData, setChartData] = useState({
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
        const tokenList = await getKRC20TokenList();
        const labels = tokenList.items.slice(0, 3).map(token => token.name);
        const data = tokenList.items.slice(0, 3).map(token => token.holders_count);
        
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

    fetchData();
  }, []);

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
      <Bar data={chartData} />
    </div>
  );
};

export default CrossTokenHolders;
