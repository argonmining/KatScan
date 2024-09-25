import {sendHeadRequest} from "./RequestService";

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = 'CG-f8E4yaD4zQYKtqHawS59TAnY';

const headers = {
    'accept': 'application/json',
    'x-cg-demo-api-key': API_KEY
}

type Crypto = { id: number, name: string, symbol: string }
export const searchCryptos = async (query: string): Promise<({ value: number, label: string } & Crypto)[]> => {
    try {
        const response = await sendHeadRequest<{ coins: Crypto[] }>({
            method: 'GET',
            url: `${COINGECKO_API_URL}/search`,
            params: {query},
            headers
        });
        return response.coins.map((coin: Crypto) => ({
            value: coin.id,
            label: `${coin.name} (${coin.symbol.toUpperCase()})`,
            ...coin
        }));
    } catch (error) {
        console.error('Error searching cryptocurrencies:', error);
        throw error;
    }
};

export const getCryptoData = async (id: number) => {
    try {
        //todo
        return sendHeadRequest({method: 'GET', url: `${COINGECKO_API_URL}/coins/${id}`, params: undefined, headers});
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
        throw error;
    }
};
