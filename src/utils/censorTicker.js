export const censorTicker = (ticker) => {
  const offensiveWords = {
    'NIGGA': 'N***A'
  };
  return offensiveWords[ticker] || ticker;
};
