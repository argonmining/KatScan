export type ResultResponse<T> = {
    message: 'success'
    result: T
}

export type TokenListResponse<T> = ResultResponse<T> & {
    prev: number
    next: number
}