import React, {FC, useCallback, useEffect, useRef, useState} from "react";
import {MobileOperationsTable} from "../../tables/MobileOperationsTable";
import {formatDateTime, formatNumber, parseRawNumber} from "../../../services/Helper";
import {Alert, Table} from "react-bootstrap";
import {LinkWithTooltip} from "../../LinkWithTooltip";
import {useMobile} from "../../../hooks/mobile";
import {OpTransactionData} from "../../../interfaces/OpTransactionData";
import {TokenSearchResult} from "../../../interfaces/TokenData";
import {getTokenOperations} from "../../../services/dataService";

type Props = {
    tokenData: TokenSearchResult
    tokenId: string | undefined
}

export const RecentOperations: FC<Props> = (
    {
        tokenData,
        tokenId
    }
) => {
    const {isMobile} = useMobile()

    const [operations, setOperations] = useState<OpTransactionData[]>([]);
    const [loadingMore, setLoadingMore] = useState(false);
    const [operationsError, setOperationsError] = useState<string | null>(null);
    const [operationsCursor, setOperationsCursor] = useState<OpTransactionData | null>(null);
    const observer = useRef<IntersectionObserver>();

    useEffect(() => {
        if (tokenId === null || tokenId === undefined) {
            return
        }
        getTokenOperations(tokenId, 50).then((opsData) => {
            setOperations(opsData);
            // todo next?
            // setOperationsCursor(opsData.next);
        })
            .catch(err => {
                console.error('Failed to fetch operations:', err);
                setOperationsError('Failed to fetch operation details');
            })
    }, [tokenId])

    const fetchOperations = useCallback(async () => {
        if (loadingMore || !operationsCursor || tokenId === undefined) return;
        try {
            setLoadingMore(true);
            setOperationsError(null);
            // eslint-disable-next-line
            // @ts-ignore
            const data = await getTokenOperations(tokenId, 50, operationsCursor);
            setOperations(prevOps => [...prevOps, ...data]);
            //todo
            // setOperationsCursor(data.next);
        } catch (err) {
            console.error('Failed to fetch operations:', err);
            setOperationsError('Failed to load more operations. Please try again.');
        } finally {
            setLoadingMore(false);
        }
    }, [tokenId, operationsCursor, loadingMore]);

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
        <div className="detail-table-container">
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
                    {operations && operations.map((op, index) => (
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
        {operationsError && <Alert variant="danger">{operationsError}</Alert>}
        {!operationsCursor && !loadingMore && <div>No more operations to load.</div>}
    </>
}