import {useEffect, useMemo, useRef, useState} from "react";
import {sendRequest} from "nacho-component-library";
import {addAlert} from "../components/alerts/Alerts";
import {emptyArray, katscanApiUrl} from "../utils/StaticVariables";
import {generateUniqueID} from "web-vitals/dist/modules/lib/generateUniqueID";
import {KatscanResponse} from "../interfaces/ApiResponseTypes";

type Props = {
    url: string
    defaultValue?: never[] | Record<string, unknown>
    errorMessage?: string
    successMessage?: string
    params?: Record<string, string | number>
}
type GETFetch = Props & {
    method?: 'GET'
    body?: never
}

type POSTFetch = Props & {
    method: 'POST' | 'PUT'
    body: Record<string, unknown> | string
}

type Return<T> = {
    data: T
    cursor?: string
    loading: boolean
    error: boolean
}

export type Params = {
    limit?: number,
    cursor?: string,
    sortOrder?: string,
    sortBy?: string
}

type UseFetch = POSTFetch | GETFetch

export function useFetch<T>(
    {
        url,
        defaultValue = emptyArray,
        errorMessage,
        successMessage,
        method = 'GET',
        params,
        body
    }: UseFetch
): Return<T> {
    const [data, setData] = useState<T>(defaultValue as T)
    const [cursor, setCursor] = useState<string>()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const loadingRef = useRef<string>()

    const internalUrl = useMemo(() => {
        if (!url) {
            return
        }
        if (url.includes('http') || !url.startsWith('/')) {
            // url is not a subpath, we use the given url
            return url
        }
        return `${katscanApiUrl}${url}`
    }, [url])

    useEffect(() => {
        if (!internalUrl) {
            return
        }
        const unique = loadingRef.current = generateUniqueID()

        setLoading(true)
        setError(false)

        let internalParams: Record<string, string> | undefined
        if (params) {
            internalParams = {}
            Object.entries(params).forEach(([key, value]) => {
                if (value && internalParams) {
                    internalParams[key] = String(value)
                }
            })
        }

        void sendRequest<KatscanResponse<T>>({
            method,
            url: internalUrl,
            body,
            params: internalParams
        })
            .then(result => {
                if (loadingRef.current !== unique) {
                    //return, the response is not valid because a new request was made
                    return
                }
                setData(result.result)
                setCursor(result.cursor)
                if (successMessage) {
                    addAlert('success', successMessage)
                }
                setLoading(false)
            })
            .catch((e) => {
                console.log(e)
                setError(true)
                if (errorMessage) {
                    addAlert('error', errorMessage)
                }
                setLoading(false)
            })
    }, [body, errorMessage, internalUrl, method, params, successMessage])

    return useMemo(() => ({
        data,
        cursor,
        loading,
        error
    }), [cursor, data, error, loading])
}