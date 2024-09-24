export type WalletToken = {
    tick: string
    balance: number
    locked: string
    dec: number
    opScoreMod: string
//  todo check
    contract?: string
}

export type WalletBalance = {
    address: string
    balance: number
}
export type WalletTotal = {
    total: number
}

export type Utxos = {
    address: string,
    outpoint: {
        transactionId: string
        index: number
    }
    utxoEntry: {
        amount: string
        scriptPublicKey: {
            scriptPublicKey: string
        },
        blockDaaScore: string
        isCoinbase: boolean
    }
}