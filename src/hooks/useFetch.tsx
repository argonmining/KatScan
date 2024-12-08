import {useEffect, useMemo, useRef, useState} from "react";
import {sendRequest} from "nacho-component-library";
import {addAlert} from "../components/alerts/Alerts";
import {emptyArray} from "../utils/StaticVariables";
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

    useEffect(() => {
        if (!url) {
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
            url: url.includes('http') ? url : `${process.env.REACT_APP_BASE_API_URL}${url}`,
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
    }, [body, errorMessage, method, params, successMessage, url])

    return useMemo(() => ({
        data,
        cursor,
        loading,
        error
    }), [cursor, data, error, loading])
}