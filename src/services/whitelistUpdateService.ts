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
            url: `${wlUpdateApiUrl}/api/update-whitelist`,
            method: 'POST',
            body: JSON.stringify(data),
        }).catch(() => {
            throw new Error('Failed to update whitelist')
        })
    }
}; 