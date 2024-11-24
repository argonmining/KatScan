import {useCallback, useEffect, useMemo, useState} from 'react'
import {simpleRequest} from "nacho-component-library";
import {Transaction} from "../../../interfaces/Transaction";

export type TransactionStore = {
    transactions: Transaction[]
    transactionPage: number
    loadingTransactions: boolean
    loadMore: () => void
    hasMoreTransactions: boolean
}
export const useTransactions = (walletAddress: string): TransactionStore => {

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [transactionPage, setTransactionPage] = useState(0);
    const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
    const [loadingTransactions, setLoadingTransactions] = useState(false);

    const fetchTransactions = useCallback(async (addr: string, page: number) => {
        setLoadingTransactions(true);
        try {
            const result = await simpleRequest<Transaction[]>(`https://api.kaspa.org/addresses/${addr}/full-transactions?limit=20&offset=${page * 20}&resolve_previous_outpoints=light`);
            setTransactionPage(page + 1);
            setHasMoreTransactions(result.length === 20);
            setLoadingTransactions(false);
            return result
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            return []
        }
    }, []);

    useEffect(() => {
        if (walletAddress === undefined) {
            return
        }
        fetchTransactions(walletAddress, 0)
            .then(newTransactions => {
                setTransactions(newTransactions);
            })
    }, [walletAddress, fetchTransactions])

    const loadMore = useCallback(() => {
        if (hasMoreTransactions) {
            fetchTransactions(walletAddress, transactionPage)
                .then(result => {
                    setTransactions(current => ([...current, ...result]))
                })
        }
    }, [fetchTransactions, loadingTransactions, hasMoreTransactions, transactionPage, walletAddress])

    return useMemo((): TransactionStore => {
        return {
            transactions,
            transactionPage,
            loadingTransactions,
            loadMore,
            hasMoreTransactions
        }
    }, [transactions,
        transactionPage,
        loadingTransactions,
        loadMore,
        hasMoreTransactions])
}