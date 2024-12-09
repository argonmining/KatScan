export type TokenData = {
    tick: string
    max: number
    lim: string
    pre: string
    to: string
    dec: number
    minted: number
    opScoreAdd: string
    opScoreMod: string
    state: string
    hashRev: string
    mtsAdd: string
    logo: string
}

export type TokenSearchResult = TokenData & {
    holderTotal: string
    transferTotal: string
    mintTotal: string
    holder: Holder[]
}

type Holder = {
    address: string
    amount: number
}

export type TopHolder = {
    address: string
    balances: { tick: string, balance: string }[]
}