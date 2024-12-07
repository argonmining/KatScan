import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {TokenData} from "../interfaces/TokenData";
import {getKRC20TokenListSequential} from "../services/dataService";
import {generateUniqueID} from "web-vitals/dist/modules/lib/generateUniqueID";
import {addAlert} from "../components/alerts/Alerts";

const ITEMS_PER_PAGE = 100;

export const useFetchAllToken = (sortField?: string, sortDirection?: string): {
    tokens: (TokenData & { id: string })[],
    loading: boolean,
    error: boolean,
    resetAll: () => void
} => {
    const [tokens, setTokens] = useState<(TokenData & { id: string })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<boolean>(false);
    const [cursor, setCursor] = useState<null | string>(null)
    const [isFinished, setIsFinished] = useState<boolean>(false)

    const loadingRef = useRef<string | null>()

    const resetAll = useCallback(() => {
        setTokens([])
        setCursor(null)
        setIsFinished(false)
        setError(false)
        loadingRef.current = undefined
    }, [])

    useEffect(() => {
        let isMounted = true;

        if (isFinished || loadingRef.current === cursor) {
            return;
        }

        const fetchAllTokens = async (): Promise<void> => {
            try {
                setLoading(true);
                loadingRef.current = cursor;
                const data = await getKRC20TokenListSequential(ITEMS_PER_PAGE, sortField, sortDirection, cursor);
                console.log(data)
                if (loadingRef.current !== cursor) {
                    return;
                }
                const tempRes = data.result.map(single => ({...single, id: generateUniqueID()}))
                setTokens(current => ([...current, ...tempRes]));

                if (data.cursor === null) {
                    setIsFinished(true);
                    setLoading(false);
                    return;
                }
                setCursor(data.cursor);
            } catch (err) {
                console.error('Error in TokenOverview:', err);
                if (isMounted) {
                    addAlert('error', `Failed to fetch tokens: ${(err as Record<string, string>).message}`);
                    setLoading(false);
                    setError(true)
                }
            }
        };
        void fetchAllTokens();

        return () => {
            isMounted = false;
        };
    }, [sortField, sortDirection, cursor, isFinished]);

    return useMemo(() => ({
        tokens,
        resetAll,
        loading,
        error
    }), [error, loading, resetAll, tokens])
}