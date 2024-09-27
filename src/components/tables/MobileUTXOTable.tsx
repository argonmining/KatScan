import {Card} from "react-bootstrap";
import React, {FC} from "react";
import {Utxos} from "../../interfaces/WalletData";
import 'styles/components/MobileTable.css'

type Props = {
    utxos: Utxos[]
    openExplorer: (transactionId: string) => void
    formatNumber: (number: number) => string
    shortenString: (str: string) => string
}
export const MobileUTXOTable: FC<Props> = (
    {
        utxos,
        openExplorer,
        formatNumber,
        shortenString
    }
) => (
    <div className="mobile-table">
        {utxos.map(utxo => (
            <Card key={`${utxo.outpoint.transactionId}-${utxo.outpoint.index}`} className="mb-3">
                <Card.Body>
                    <div className="mobile-table-row" onClick={() => openExplorer(utxo.outpoint.transactionId)}>
                        <div className="mobile-table-cell">
                            <strong>Transaction ID:</strong> {shortenString(utxo.outpoint.transactionId)}
                        </div>
                        <div className="mobile-table-cell">
                            <strong>Index:</strong> {utxo.outpoint.index}
                        </div>
                        <div className="mobile-table-cell">
                            <strong>Amount (KAS):</strong> {formatNumber(parseInt(utxo.utxoEntry.amount) / 1e8)}
                        </div>
                        <div className="mobile-table-cell">
                            <strong>Block DAA Score:</strong> {utxo.utxoEntry.blockDaaScore}
                        </div>
                        <div className="mobile-table-cell">
                            <strong>Miner Reward:</strong> {utxo.utxoEntry.isCoinbase ? 'Yes' : 'No'}
                        </div>
                        <div className="mobile-table-cell">
                            <strong>Status:</strong> Unspent
                        </div>
                    </div>
                </Card.Body>
            </Card>
        ))}
    </div>
);