import {KatscanResponse} from "../interfaces/ApiResponseTypes";
import {wlUpdateApiUrl} from "../utils/StaticVariables";

interface GetFeeResponse {
    amount: string;
    amountInKAS: string;
    feeWallet: string;
}

interface UpdateWhitelistRequest {
    feeAmount: string;
    feeAddress: string;
    oldAddress: string;
    newAddress: string;
    whitelistID: string;
    txnID: string;
}

export const whitelistUpdateService = {
    getFee: async (): Promise<KatscanResponse<GetFeeResponse>> => {
        const response = await fetch(`${wlUpdateApiUrl}/api/get-fee`);
        if (!response.ok) {
            throw new Error('Failed to fetch fee information');
        }
        const data = await response.json() as KatscanResponse<GetFeeResponse>;
        return data;
    },

    updateWhitelist: async (data: UpdateWhitelistRequest): Promise<KatscanResponse<unknown>> => {
        const response = await fetch(`${wlUpdateApiUrl}/api/update-whitelist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            throw new Error('Failed to update whitelist');
        }
        const responseData = await response.json() as KatscanResponse<unknown>;
        return responseData;
    }
}; 