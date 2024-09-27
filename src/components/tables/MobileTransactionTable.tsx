import React, {FC} from "react";
import {Card} from "react-bootstrap";
import {Transaction} from "../../interfaces/Transaction";
import 'styles/components/MobileTable.css'

type Props = {
    transactions: Transaction[]
    openExplorer: (transactionId: string) => void
    formatNumber: (number: number) => string
    shortenString: (transactionId: string) => string
}

export const MobileTransactionTable: FC<Props> = (
    {
        transactions,
        openExplorer,
        formatNumber,
        shortenString
    }
) => (
    <div className="mobile-table">
        {transactions.map(tx => (
            <Card key={tx.transaction_id} className="mb-3">
                <Card.Body>
                    <div className="mobile-table-row" onClick={() => openExplorer(tx.transaction_id)}>
                        <div className="mobile-table-cell">
                            <strong>Transaction ID:</strong>
                            {shortenString(tx.transaction_id)}
                        </div>
                        <div className="mobile-table-cell">
                            <strong>Amount (KAS):</strong>
                            {formatNumber(tx.outputs.reduce((sum, output) => sum + parseInt(output.amount), 0) / 1e8)}
                        </div>
                        <div className="mobile-table-cell">
                            <strong>Block Time:</strong> {new Date(tx.block_time).toLocaleString()}
                        </div>
                    </div>
                </Card.Body>
            </Card>
        ))}
    </div>
);