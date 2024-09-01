import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../styles/CrossTokenHolders.css';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const CrossTokenHolders = () => {
  // Placeholder data, in a real application this would come from an API
  const data = {
    labels: ['Token 1', 'Token 2', 'Both Tokens'],
    datasets: [
      {
        label: 'Number of Holders',
        data: [100, 150, 50],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="cross-token-holders">
      <h3>Cross-Token Holders Analysis</h3>
      <Bar data={data} />
    </div>
  );
};

export default CrossTokenHolders;
