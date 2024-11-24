import React, {FC, useCallback, useRef} from 'react'
import {MobileTransactionTable} from "../../tables/MobileTransactionTable";
import {formatNumber, shortenString} from "../../../services/Helper";
import {Table} from "react-bootstrap";
import {useMobile} from "nacho-component-library";
import {TransactionStore} from "./useTransactions";

export const TransactionOverview: FC<TransactionStore> = (
    {
        transactions,
        loadingTransactions,
        transactionPage,
        loadMore,
        hasMoreTransactions
    }
) => {

    const {isMobile} = useMobile()
    const transactionObserver = useRef<IntersectionObserver>();

    const lastTransactionElementRef = useCallback((node: HTMLTableRowElement) => {
        if (loadingTransactions) {
            return
        }
        if (transactionObserver.current) {
            transactionObserver.current.disconnect()
        }
        transactionObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreTransactions) {
                loadMore();
            }
        });
        if (node) transactionObserver.current.observe(node);
    }, [loadingTransactions, hasMoreTransactions, transactionPage, loadMore]);

    const openExplorer = (transactionId: string) => {
        window.open(`https://explorer.kaspa.org/txs/${transactionId}`, '_blank', 'noopener,noreferrer');
    };

    return <div className="table-wrapper">
        {isMobile ? (
            <MobileTransactionTable
                transactions={transactions}
                openExplorer={openExplorer}
                formatNumber={formatNumber}
                shortenString={shortenString}
            />
        ) : (
            <Table striped bordered hover>
                <thead>
                <tr>
                    <th>Transaction ID</th>
                    <th>Amount (KAS)</th>
                    <th>Block Time</th>
                </tr>
                </thead>
                <tbody>
                {transactions.map((tx, index) => (
                    <tr
                        key={tx.transaction_id}
                        ref={index === transactions.length - 1 ? lastTransactionElementRef : null}
                        onClick={() => openExplorer(tx.transaction_id)}
                        className="clickable-row"
                    >
                        <td>{tx.transaction_id}</td>
                        <td>{formatNumber(tx.outputs.reduce((sum, output) => sum + parseInt(output.amount), 0) / 1e8)}</td>
                        <td>{new Date(tx.block_time).toLocaleString()}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        )}
        {loadingTransactions &&
            <div className="loading-message">Loading more transactions...</div>}
    </div>
}