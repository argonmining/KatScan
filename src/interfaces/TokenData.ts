export type TokenData = {
    tick: string
    max: number
    lim: number
    pre: number
    to: string
    dec: number
    minted: number
    opScoreAdd: string
    opScoreMod: string
    state: string
    hashRev: string
    mtsAdd: number
    logo: string
    holderTotal: number
    transferTotal: number
    mintTotal: number
    socials?: string
}


export type TokenHolder = {
    address: string
    balance: number
}

export type TopHolder = {
    address: string
    balances: { tick: string, amount: number }[]
    tokenCount: number
}