import axios from 'axios';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = 'CG-f8E4yaD4zQYKtqHawS59TAnY';

const axiosInstance = axios.create({
    baseURL: COINGECKO_API_URL,
    headers: {
        'accept': 'application/json',
        'x-cg-demo-api-key': API_KEY
    }
});

export const searchCryptos = async (query) => {
    try {
        const response = await axiosInstance.get('/search', {
            params: { query }
        });
        return response.data.coins.map(coin => ({
            value: coin.id,
            label: `${coin.name} (${coin.symbol.toUpperCase()})`,
            ...coin
        }));
    } catch (error) {
        console.error('Error searching cryptocurrencies:', error);
        throw error;
    }
};

export const getCryptoData = async (id) => {
    try {
        const response = await axiosInstance.get(`/coins/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
        throw error;
    }
};
