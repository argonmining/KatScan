import {TokenData, TokenHolder} from "../interfaces/TokenData";
import {sendRequest, simpleRequest} from "nacho-component-library";
import {
    KatscanResponse,
    KatscanTokenListResponse,
    ResultResponse,
    TokenListResponse
} from "../interfaces/ApiResponseTypes";
import {OpTransactionData} from "../interfaces/OpTransactionData";
import {katscanApiUrl} from "../utils/StaticVariables";

const BASE_URL = 'https://api.kasplex.org/v1';

// Simulating an API call to fetch token details
export const getTokenDetails = async (tick: string): Promise<KatscanResponse<TokenHolder>> => {
    try {
        return await simpleRequest<KatscanResponse<TokenHolder>>(`${katscanApiUrl}/token/detail/${tick}`)
    } catch (error) {
        console.error('Error fetching token details:', error);
        throw error;
    }
};

// New function to fetch KRC-20 token list
export const getKRC20TokenList = async (limit = 100, sortField = 'holderTotal', sortDirection = 'desc'): Promise<{
    result: TokenData[]
}> => {
    let allTokens: TokenData[] = [];
    let cursor = null;

    do {
        const params: Record<string, string | number> = {
            limit,
            sortBy: sortField,
            sortOrder: sortDirection,
            ...(cursor && {cursor: cursor})
        };

        try {
            const response = await sendRequest<KatscanTokenListResponse<TokenData[]>>({
                method: 'GET',
                url: `${katscanApiUrl}/token/tokenlist`,
                params
            });
            allTokens = [...allTokens, ...response.result];
            cursor = response.nextCursor;
        } catch (error) {
            console.error('Error fetching KRC20 token list:', error);
            throw new Error(`Failed to fetch token list: ${(error as Record<string, string>).message}`);
        }
    } while (cursor);

    return {result: allTokens};
};

// New function to fetch KRC-20 token list
export const getKRC20TokenListSequential = async (limit = 100, sortField = 'holderTotal', sortDirection = 'desc', cursor: string | null): Promise<{
    result: TokenData[], cursor: string
}> => {
    const params: Record<string, string | number> = {
        limit,
        sortBy: sortField || 'holderTotal',
        sortOrder: sortDirection || 'desc',
        ...(cursor && {cursor: cursor})
    };

    try {
        const response = await sendRequest<KatscanTokenListResponse<TokenData>>({
            method: 'GET',
            url: `${katscanApiUrl}/token/tokenlist`,
            params
        });
        return {result: response.tokens, cursor: response.nextCursor}
        // cursor = response.next;
    } catch (error) {
        console.error('Error fetching KRC20 token list:', error);
        throw new Error(`Failed to fetch token list: ${(error as Record<string, string>).message}`);
    }
    // } while (cursor);


};

// New function to fetch token operations
export const getTokenOperations = async (tick: string, limit = 50, cursor: null | number = null): Promise<TokenListResponse<OpTransactionData[]>> => {
    try {
        const params: Record<string, string | number> = {tick, limit: limit.toString()}
        if (cursor) params['next'] = cursor
        return sendRequest<TokenListResponse<OpTransactionData[]>>({
            method: 'GET', url: `${BASE_URL}/krc20/oplist`, params
        });
    } catch (error) {
        console.error('Error fetching token operations:', error);
        throw error;
    }
};

// New function to fetch mint operations
export const getMintOperations = async (tick: string, limit = 50, cursor = null): Promise<OpTransactionData[]> => {
    try {
        const params: Record<string, string> = {tick, limit: limit.toString(), op: 'mint'}
        if (cursor) params['next'] = cursor
        const response = await sendRequest<TokenListResponse<OpTransactionData[]>>({
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
export const getDetailedTokenInfo = async (tick: string): Promise<TokenData> => {
    try {
        const response = await simpleRequest<ResultResponse<TokenData>>(`${katscanApiUrl}/token/detail/${tick}`);
        return response.result;
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
