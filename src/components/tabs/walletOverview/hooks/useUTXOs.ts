import {useCallback, useEffect, useMemo, useState} from "react";
import {Utxos} from "../../../../interfaces/WalletData";
import {simpleRequest} from "nacho-component-library";

export type UTXOStore = {
    utxos: Utxos[]
    utxoPage: number
    loadingUtxos: boolean
    loadMore: () => void
    hasMoreUtxos: boolean
}

export const useUTXOs = (addressValid: boolean, walletAddress: string | undefined): UTXOStore => {

    const [utxos, setUtxos] = useState<Utxos[]>([]);
    const [utxoPage, setUtxoPage] = useState(0);
    const [hasMoreUtxos, setHasMoreUtxos] = useState(true);
    const [loadingUtxos, setLoadingUtxos] = useState(false);

    const optimiseData = useCallback((newUtxos: Utxos[]) => {
        setUtxos(prevUtxos => {
            // Create a Set of unique identifiers for existing UTXOs
            const existingUtxoSet = new Set(
                prevUtxos.map(utxo => `${utxo.outpoint.transactionId}-${utxo.outpoint.index}`)
            );

            // Filter out duplicates from the new UTXOs
            const uniqueNewUtxos = newUtxos.filter(
                utxo => !existingUtxoSet.has(`${utxo.outpoint.transactionId}-${utxo.outpoint.index}`)
            );

            return [...prevUtxos, ...uniqueNewUtxos];
        });

    }, [])

    const fetchUtxos = useCallback(async (addr: string, page: number) => {
        setLoadingUtxos(true);
        try {
            const newUtxos = await simpleRequest<Utxos[]>(`https://api.kaspa.org/addresses/${addr}/utxos?limit=20&offset=${page * 20}`);
            setUtxoPage(page + 1);
            setHasMoreUtxos(newUtxos.length === 20);
            return newUtxos
        } catch (err) {
            console.error('Failed to fetch UTXOs:', err);
            return []
        } finally {
            setLoadingUtxos(false);
        }
    }, [])

    useEffect(() => {
        if (!walletAddress || !addressValid) {
            return
        }
        void fetchUtxos(walletAddress, 0)
            .then(setUtxos)
    }, [addressValid, fetchUtxos, walletAddress]);

    const loadMore = useCallback(() => {
        if (!walletAddress) {
            return
        }
        if (hasMoreUtxos) {
            void fetchUtxos(walletAddress, utxoPage)
                .then(optimiseData)
        }
    }, [fetchUtxos, hasMoreUtxos, optimiseData, utxoPage, walletAddress])

    return useMemo((): UTXOStore => {
        return {
            utxos,
            utxoPage,
            hasMoreUtxos,
            loadingUtxos,
            loadMore
        }
    }, [hasMoreUtxos, loadMore, loadingUtxos, utxoPage, utxos])
}