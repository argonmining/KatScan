import {TokenData, TokenSearchResult} from "../interfaces/TokenData";
import {sendRequest, simpleRequest} from "./RequestService";
import {TokenListResponse, TokenResponse} from "../interfaces/ApiResponseTypes";
import {OpData} from "../interfaces/OpData";

const BASE_URL = 'https://api.kasplex.org/v1';

// Simulating an API call to fetch token details
export const getTokenDetails = async (tick: string): Promise<TokenSearchResult> => {
    try {
        const response = await simpleRequest<TokenResponse<TokenSearchResult[]>>(`${BASE_URL}/krc20/token/${tick}`);
        return response.result[0];
    } catch (error) {
        console.error('Error fetching token details:', error);
        throw error;
    }
};

// New function to fetch KRC-20 token list
export const getKRC20TokenList = async (limit = 50, sortField = '', sortDirection = 'asc'): Promise<{
    result: TokenData[]
}> => {
    let allTokens: TokenData[] = [];
    let cursor = null;

    //todo
    do {
        const params: Record<string, string | number> = {
            limit,
            ...(sortField && {sort: `${sortField}:${sortDirection}`}),
            ...(cursor && {next: cursor})
        };

        try {
            const response = await sendRequest<TokenListResponse<TokenData[]>>({
                method: 'GET',
                url: `${BASE_URL}/krc20/tokenlist`,
                params
            });
            allTokens = [...allTokens, ...response.result];
            cursor = response.next;
        } catch (error) {
            console.error('Error fetching KRC20 token list:', error);
            // @ts-ignore todo define error
            throw new Error(`Failed to fetch token list: ${error.message}`);
        }
    } while (cursor);

    return {result: allTokens};
};

// New function to fetch token operations
export const getTokenOperations = async (tick: string, limit = 50, cursor = null): Promise<OpData[]> => {
    try {
        const params: Record<string, string> = {tick, limit: limit.toString()}
        if (cursor) params['next'] = cursor
        const response = await sendRequest<TokenListResponse<OpData[]>>({
            method: 'GET', url: `${BASE_URL}/krc20/oplist`, params
        });
        return response.result;
    } catch (error) {
        console.error('Error fetching token operations:', error);
        throw error;
    }
};

// New function to fetch mint operations
export const getMintOperations = async (tick: string, limit = 50, cursor = null): Promise<OpData[]> => {
    try {
        const params: Record<string, string> = {tick, limit: limit.toString(), op: 'mint'}
        if (cursor) params['next'] = cursor
        const response = await sendRequest<TokenListResponse<OpData[]>>({
            method: 'GET',
            url: `${BASE_URL}/krc20/oplist`,
            params
        });
        return response.result;
    } catch (error) {
        console.error('Error fetching mint operations:', error);
        throw error;
    }
};

// Add this new function to fetch detailed token information
export const getDetailedTokenInfo = async (tick: string): Promise<TokenSearchResult> => {
    try {
        const response = await simpleRequest<TokenResponse<TokenSearchResult[]>>(`${BASE_URL}/krc20/token/${tick}`);
        return response.result[0];
    } catch (error) {
        console.error('Error fetching detailed token information:', error);
        throw error;
    }
};

// Add this new function to fetch all mint transactions
// todo invalid url params / more needed
// export const getAllMintTransactions = async () => {
//     const BASE_URL = 'https://katapi.nachowyborski.xyz/api';
//     let allTransactions = [];
//     let currentPage = 1;
//     let hasNextPage = true;
//
//     while (hasNextPage) {
//         try {
//             const response = await sendRequest({
//                     method: 'GET',
//                     url: `${BASE_URL}/transactions`,
//                     params: {op: 'mint', page: currentPage}
//                 }
//             );
//
//             const {transactions, pagination} = response.data;
//             allTransactions = [...allTransactions, ...transactions];
//
//             hasNextPage = pagination.hasNextPage;
//             currentPage++;
//         } catch (error) {
//             console.error('Error fetching mint transactions:', error);
//             throw error;
//         }
//     }
//
//     return allTransactions;
// };
