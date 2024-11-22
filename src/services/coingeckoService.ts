
import {CoinbaseInfo} from "../interfaces/CoinbaseInfo";
import {sendHeadRequest} from "nacho-component-library";

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
const API_KEY = 'CG-f8E4yaD4zQYKtqHawS59TAnY';

const headers = {
    'accept': 'application/json',
    'x-cg-demo-api-key': API_KEY
}

type Crypto = { id: string, name: string, symbol: string }
export type CryptoSearch = { value: string, label: string } & Crypto
export const searchCryptos = async (query: string): Promise<CryptoSearch[]> => {
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

export const getCryptoData = async (id: string) :Promise<CoinbaseInfo> => {
    try {
        return sendHeadRequest<CoinbaseInfo>({method: 'GET', url: `${COINGECKO_API_URL}/coins/${id}`, params: undefined, headers});
    } catch (error) {
        console.error('Error fetching cryptocurrency data:', error);
        throw error;
    }
};
