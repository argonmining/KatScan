import {useCallback, useEffect, useMemo, useState} from 'react'
import {simpleRequest} from "nacho-component-library";
import {Transaction} from "../../../../interfaces/Transaction";

export type TransactionStore = {
    transactions: Transaction[]
    transactionPage: number
    loadingTransactions: boolean
    loadMore: () => void
    hasMoreTransactions: boolean
}
export const useTransactions = (addressValid: boolean, walletAddress: string | undefined): TransactionStore => {

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
            return result
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            return []
        } finally {
            setLoadingTransactions(false);
        }
    }, []);

    useEffect(() => {
        if (!walletAddress || !addressValid) {
            return
        }
        void fetchTransactions(walletAddress, 0)
            .then(setTransactions)
    }, [walletAddress, fetchTransactions, addressValid])

    const loadMore = useCallback(() => {
        if (!walletAddress){
            return
        }
        if (hasMoreTransactions) {
            void fetchTransactions(walletAddress, transactionPage)
                .then(result => {
                    setTransactions(current => ([...current, ...result]))
                })
        }
    }, [fetchTransactions, hasMoreTransactions, transactionPage, walletAddress])

    return useMemo((): TransactionStore => {
        return {
            transactions,
            transactionPage,
            loadingTransactions,
            loadMore,
            hasMoreTransactions
        }
    }, [
        transactions,
        transactionPage,
        loadingTransactions,
        loadMore,
        hasMoreTransactions
    ])
}