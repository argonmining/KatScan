export type ResultResponse<T> = {
    message: 'success'
    result: T
}

export type TokenListResponse<T> = ResultResponse<T> & {
    prev: number
    next: number
}
export type KatscanTokenListResponse<T> = ResultResponse<T> & {
    tokens: T[]
    nextCursor: string
}
export type KatscanResponse<T> = {
    result: T
    cursor?: string
}