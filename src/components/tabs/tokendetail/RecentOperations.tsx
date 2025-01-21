import React, {Dispatch, FC, SetStateAction, useCallback, useEffect, useRef, useState} from "react";
import {MobileOperationsTable} from "../../tables/MobileOperationsTable";
import {formatDateTime, formatNumber, parseRawNumber} from "../../../services/Helper";
import {Table} from "react-bootstrap";
import {LinkWithTooltip, useMobile} from "nacho-component-library";
import {OpTransactionData} from "../../../interfaces/OpTransactionData";
import {TokenData} from "../../../interfaces/TokenData";
import {getTokenOperations} from "../../../services/dataService";
import {addAlert} from "../../alerts/Alerts";

type Props = {
    tokenData: TokenData
    tokenId: string | undefined
    operations: OpTransactionData[]
    setOperations: Dispatch<SetStateAction<OpTransactionData[]>>
    operationsCursor: number | null
    setOperationsCursor: Dispatch<SetStateAction<number | null>>
}

export const RecentOperations: FC<Props> = (
    {
        tokenData,
        tokenId,
        operations,
        setOperations,
        operationsCursor,
        setOperationsCursor
    }
) => {
    const {isMobile} = useMobile()

    const [loadingMore, setLoadingMore] = useState(false);
    const observer = useRef<IntersectionObserver>();

    useEffect(() => {
        if (tokenId === null || tokenId === undefined || operations.length !== 0) {
            return
        }

        getTokenOperations(tokenId, 50)
            .then((opsData) => {
                setOperations(opsData.result);
                setOperationsCursor(opsData.next);
            })
            .catch(err => {
                console.error('Failed to fetch operations:', err);
                addAlert('error', 'Failed to fetch operation details');
            })
    }, [operations.length, setOperations, setOperationsCursor, tokenId])

    const fetchOperations = useCallback(async () => {
        if (loadingMore || !operationsCursor || tokenId === undefined) return;
        try {
            setLoadingMore(true);
            const data = await getTokenOperations(tokenId, 50, operationsCursor);
            setOperations(prevOps => [...prevOps, ...data.result]);
            setOperationsCursor(data.next);
        } catch (err) {
            console.error('Failed to fetch operations:', err);
            addAlert('error', 'Failed to load more operations. Please try again.');
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, operationsCursor, tokenId, setOperations, setOperationsCursor]);

    const lastOperationElementRef = useCallback((node: HTMLTableRowElement) => {
        if (loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && operationsCursor) {
                void fetchOperations();
            }
        });
        if (node) observer.current?.observe(node);
    }, [loadingMore, operationsCursor, fetchOperations]);

    return <>
        <div className="detail-table-container" style={{height: '100%'}}>
            {isMobile ? (
                <MobileOperationsTable
                    data={operations}
                    tokenData={tokenData}
                />
            ) : (
                <Table striped bordered hover>
                    <thead>
                    <tr>
                        <th>Type</th>
                        <th>Transaction ID</th>
                        <th>Address</th>
                        <th>Amount</th>
                        <th>Timestamp</th>
                    </tr>
                    </thead>
                    <tbody>
                    {operations.map((op, index) => (
                        <tr key={index}
                            ref={index === operations.length - 1 ? lastOperationElementRef : null}>
                            <td>{op.op}</td>
                            <td>
                                <LinkWithTooltip
                                    to={`/transaction-lookup/${op.hashRev}`}
                                    tooltip="View transaction details"
                                    className="clickable-address"
                                >
                                    {op.hashRev}
                                </LinkWithTooltip>
                            </td>
                            <td>
                                <LinkWithTooltip
                                    to={`/wallet/${op.op === 'mint' ? op.to : op.from}`}
                                    tooltip="View wallet details"
                                    className="clickable-address"
                                >
                                    {op.op === 'mint' ? op.to : op.from}
                                </LinkWithTooltip>
                            </td>
                            <td>{formatNumber(parseRawNumber(op.amt, tokenData.dec), tokenData.dec)}</td>
                            <td>{formatDateTime(op.mtsAdd)}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </div>
        {loadingMore && <div>Loading more operations...</div>}
        {!operationsCursor && !loadingMore && <div>No more operations to load.</div>}
    </>
}