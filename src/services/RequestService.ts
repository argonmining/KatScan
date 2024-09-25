type Request = {
    method: 'POST' | 'GET' | 'PUT'
    url: string
    body?: Record<string, unknown> | string
    params?: Record<string, string | number>
}

/**
 * Function to send a simple GET request
 */
export const simpleRequest = async <T>(url: Request['url']): Promise<T> => {
    const response = await fetch(
        url,
        {
            method: 'GET'
        })

    if (response.status !== 200) {
        throw Error('fetching failed')
    }
    try {
        return await response.json() as T
    } catch (e) {
        // if json paring fails, return the response
        return response as T
    }
};

/**
 * Function to send an api request
 */
export const sendRequest = async <T>({method, url, body, params}: Request): Promise<T> => {
    const response = await fetch(
        params ? mapParams(url, params) : url,
        {
            method,
            // check if needed
            body: typeof body === 'string' ? body : JSON.stringify(body)
        })

    if (response.status !== 200) {
        throw Error('fetching failed')
    }
    try {
        return await response.json() as T
    } catch (e) {
        // if json paring fails, return the response
        return response as T
    }
};

/**
 * Function to send an api request with a header
 */
export const sendHeadRequest = async <T>({method, url, body, params, headers}: Request & {headers:Record<string,string>}): Promise<T> => {
    const response = await fetch(
        params ? mapParams(url, params) : url,
        {
            method,
            // check if needed
            body: typeof body === 'string' ? body : JSON.stringify(body),
            headers: headers
        })

    if (response.status !== 200) {
        throw Error('fetching failed')
    }
    try {
        return await response.json() as T
    } catch (e) {
        // if json paring fails, return the response
        return response as T
    }
};

/**
 * Function to map the url params
 */
const mapParams = (url: string, data: Record<string, string | number>): string => {
    let newUrl = url

    Object.entries(data).map(([key, value], index) => {
        if (index === 0) {
            newUrl += `?${key}=${value}`
        } else {
            newUrl += `&${key}=${value}`
        }
    })
    return newUrl
}