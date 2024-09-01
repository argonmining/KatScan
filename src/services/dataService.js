// Simulating an API call to fetch token details
export const getTokenDetails = async (tokenId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: `Token ${tokenId}`,
        supply: 1000000,
        holders: 100,
        transactions: [
          { id: 1, amount: 100, date: '2024-08-30' },
          { id: 2, amount: 200, date: '2024-08-29' },
          { id: 3, amount: 50, date: '2024-08-28' },
        ],
        holderDistribution: {
          labels: ['Top 10 Holders', 'Top 50 Holders', 'Small Holders'],
          data: [60, 25, 15],
        },
        crossTokenHolders: {
          labels: ['Token 1', 'Token 2', 'Both Tokens'],
          data: [100, 150, 50],
        },
        topHolders: [
          { address: '0x123...789', holdings: 600000 },
          { address: '0xabc...def', holdings: 250000 },
          { address: '0x456...012', holdings: 100000 },
        ],
        holderChangesOverTime: {
          labels: ['2024-08-28', '2024-08-29', '2024-08-30'],
          datasets: [
            { data: [600000, 610000, 620000], color: 'rgba(75, 192, 192, 1)' },
            { data: [250000, 245000, 240000], color: 'rgba(255, 99, 132, 1)' },
            { data: [100000, 110000, 120000], color: 'rgba(54, 162, 235, 1)' },
          ],
        },
      });
    }, 1000); // Simulates network delay
  });
};
