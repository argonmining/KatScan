export type TokenResponse<T> = {
    message: 'success'
    result: T
}

export type TokenListResponse<T> = TokenResponse<T> & {
    prev: number
    next: number
}