import {wlUpdateApiUrl} from "../utils/StaticVariables";
import {sendRequest, simpleRequest} from "nacho-component-library";

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
    getFee: async (): Promise<GetFeeResponse> => {
        const data = await simpleRequest<GetFeeResponse>(`${wlUpdateApiUrl}/api/get-fee`);
        if (!data) {
            throw new Error('Failed to fetch fee information');
        }
        // const data = await response.json() as GetFeeResponse;
        return data;
    },

    updateWhitelist: async (data: UpdateWhitelistRequest): Promise<void> => {
        return await sendRequest<void>({
            url: `http://localhost:7713/api/test`,
            method: 'POST',
            body: data as unknown as Record<string, unknown>,
        }).catch(() => {
            throw new Error('Failed to update whitelist')
        })
    }
}; 