import React, {FC, useCallback, useRef} from "react";
import {MobileUTXOTable} from "../../tables/MobileUTXOTable";
import {formatNumber, openTransaction, shortenString} from "../../../services/Helper";
import {Table} from "react-bootstrap";
import {useMobile} from "nacho-component-library";
import {UTXOStore} from "./hooks/useUTXOs";


export const UTXOOverview: FC<UTXOStore> = (
    {
        utxos,
        hasMoreUtxos,
        loadingUtxos,
        loadMore
    }
) => {
    const {isMobile} = useMobile()
    const utxoObserver = useRef<IntersectionObserver>();

    const lastUtxoElementRef = useCallback((node: HTMLTableRowElement) => {
        if (loadingUtxos) {
            return
        }
        if (utxoObserver.current) {
            utxoObserver.current.disconnect()
        }

        utxoObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreUtxos) {
                loadMore()
            }
        })

        if (node) {
            utxoObserver.current.observe(node)
        }
    }, [loadingUtxos, hasMoreUtxos, loadMore]);

    return <div className="table-wrapper">
        {isMobile ? (
            <MobileUTXOTable
                utxos={utxos}
                openExplorer={openTransaction}
                formatNumber={formatNumber}
                shortenString={shortenString}
            />
        ) : (
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Transaction ID</th>
                    <th>Index</th>
                    <th>Amount (KAS)</th>
                    <th>Block DAA Score</th>
                    <th>Miner Reward</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {utxos.map((utxo, index) => (
                    <tr
                        key={`${utxo.outpoint.transactionId}-${utxo.outpoint.index}`}
                        ref={index === utxos.length - 1 ? lastUtxoElementRef : null}
                        onClick={() => openTransaction(utxo.outpoint.transactionId)}
                        className="clickable-row"
                    >
                        <td>{utxo.outpoint.transactionId}</td>
                        <td>{utxo.outpoint.index}</td>
                        <td>{formatNumber(parseInt(utxo.utxoEntry.amount) / 1e8)}</td>
                        <td>{utxo.utxoEntry.blockDaaScore}</td>
                        <td>{utxo.utxoEntry.isCoinbase ? 'Yes' : 'No'}</td>
                        <td>Unspent</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        )}
        {loadingUtxos && <div className="loading-message">Loading more UTXOs...</div>}
    </div>
}