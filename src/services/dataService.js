import axios from 'axios';

const BASE_URL = 'https://api.kasplex.org/v1';

// Simulating an API call to fetch token details
export const getTokenDetails = async (tick) => {
  try {
    const response = await axios.get(`${BASE_URL}/krc20/token/${tick}`);
    return response.data.result[0];
  } catch (error) {
    console.error('Error fetching token details:', error);
    throw error;
  }
};

// New function to fetch KRC-20 token list
export const getKRC20TokenList = async (limit = 50, sortField = '', sortDirection = 'asc', cursor = null, direction = 'next') => {
  let url = `${BASE_URL}/krc20/tokenlist`;
  
  const params = {
    limit,
    ...(sortField && { sort: `${sortField}:${sortDirection}` }),
    ...(cursor && { [direction]: cursor })
  };

  const fullUrl = `${url}?${new URLSearchParams(params).toString()}`;
  console.log('Requesting URL:', fullUrl);

  try {
    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching KRC20 token list:', error);
    throw new Error(`Failed to fetch token list: ${error.message}`);
  }
};

// New function to fetch token operations
export const getTokenOperations = async (tick, limit = 50, cursor = null) => {
  try {
    const params = new URLSearchParams({ tick, limit: limit.toString() });
    if (cursor) params.append('next', cursor);
    const response = await axios.get(`${BASE_URL}/krc20/oplist`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching token operations:', error);
    throw error;
  }
};

// New function to fetch mint operations
export const getMintOperations = async (tick, limit = 50, cursor = null) => {
  try {
    const params = new URLSearchParams({ tick, limit: limit.toString(), op: 'mint' });
    if (cursor) params.append('next', cursor);
    const response = await axios.get(`${BASE_URL}/krc20/oplist`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching mint operations:', error);
    throw error;
  }
};

// Add this new function to fetch detailed token information
export const getDetailedTokenInfo = async (tick) => {
  try {
    const response = await axios.get(`${BASE_URL}/krc20/token/${tick}`);
    return response.data.result[0];
  } catch (error) {
    console.error('Error fetching detailed token information:', error);
    throw error;
  }
};

// Add this new function to fetch all mint transactions
export const getAllMintTransactions = async () => {
  const BASE_URL = 'https://katapi.nachowyborski.xyz/api';
  let allTransactions = [];
  let currentPage = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    try {
      const response = await axios.get(`${BASE_URL}/transactions`, {
        params: {
          op: 'mint',
          page: currentPage
        }
      });

      const { transactions, pagination } = response.data;
      allTransactions = [...allTransactions, ...transactions];

      hasNextPage = pagination.hasNextPage;
      currentPage++;
    } catch (error) {
      console.error('Error fetching mint transactions:', error);
      throw error;
    }
  }

  return allTransactions;
};
