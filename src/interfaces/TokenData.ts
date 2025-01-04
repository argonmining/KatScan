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
}

export type TokenSearchResult = TokenData & {
    holderTotal: number
    transferTotal: number
    mintTotal: number
    holder: Holder[]
}

type Holder = {
    address: string
    amount: number
}

export type TopHolder = {
    address: string
    balances: { tick: string, amount: number }[]
    tokenCount: number
}