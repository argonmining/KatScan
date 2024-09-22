export type TokenData = {
    tick: string
    max: string
    lim: string
    pre: string
    to: string
    dec: string
    minted: string
    opScoreAdd: string
    opScoreMod: string
    state: string
    hashRev: string
    mtsAdd: string
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
