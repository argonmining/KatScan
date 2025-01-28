import {RefObject, useEffect, useImperativeHandle, useMemo, useRef, useState} from "react";
import {sendRequest} from "nacho-component-library";
import {addAlert} from "../components/alerts/Alerts";
import {emptyArray, katscanApiUrl} from "../utils/StaticVariables";
import {generateUniqueID} from "web-vitals/dist/modules/lib/generateUniqueID";
import {KatscanResponse} from "../interfaces/ApiResponseTypes";
import {sortComparison} from "../services/Helper";

export type FetchRef<T> = {
    getData: () => T
    updateData: (data: T) => void
}
type Props<T> = {
    url: string
    defaultValue?: never[] | Record<string, unknown> | null
    errorMessage?: string
    successMessage?: string
    params?: Record<string, string | number>
    avoidLoading?: boolean
    sort?: SortFetchHook
    ref?: RefObject<FetchRef<T>>
}

export type SortFetchHook = [string, 'asc' | 'desc']
type GETFetch<T> = Props<T> & {
    method?: 'GET'
    body?: never
}

type POSTFetch<T> = Props<T> & {
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

type UseFetch<T> = POSTFetch<T> | GETFetch<T>

export function useFetch<T>(
    {
        url,
        defaultValue = emptyArray,
        errorMessage,
        successMessage,
        method = 'GET',
        params,
        body,
        avoidLoading,
        sort,
        ref
    }: UseFetch<T>
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
        if (!internalUrl || avoidLoading) {
            if (avoidLoading) {
                setLoading(false)
            }
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
                if (sort && Array.isArray(result.result)) {
                    if (typeof result.result[0] === 'object') {
                        setData(result.result.sort((a: Record<string, string | number>, b: Record<string, string | number>) => sortComparison(a[sort[0]], b[sort[0]], sort[1])))
                    } else {
                        setData(result.result.sort((a, b) => sortComparison(a, b, sort[1])))
                    }
                } else {
                    setData(result.result)
                }
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
    }, [avoidLoading, body, errorMessage, internalUrl, method, params, sort, successMessage])
    useImperativeHandle(ref, () => {
        return {
            updateData: (newData: T) => setData(newData),
            getData: () => data
        }
    }, [data])

    return useMemo(() => ({
        data,
        cursor,
        loading,
        error
    }), [cursor, data, error, loading])
}