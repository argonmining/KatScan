import React, {FC, FormEvent, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Accordion, Alert, Badge, Button, Card, Col, Container, Form, InputGroup, Row} from 'react-bootstrap';
import {FaArrowRight, FaCopy, FaExternalLinkAlt, FaSearch} from 'react-icons/fa';
import 'styles/TransactionLookup.css';
import SEO from '../components/SEO';
import JsonLd from '../components/JsonLd';
import {LoadingSpinner} from "../components/LoadingSpinner";
import {simpleRequest} from "../services/RequestService";
import {OpTransactionData} from "../interfaces/OpTransactionData";
import {Transaction} from "../interfaces/Transaction";
import {ResultResponse} from "../interfaces/ApiResponseTypes";

type TransactionData = {
    krc20Data: OpTransactionData
    revealData: Transaction
    commitData: {
        outputs: { script_public_key_address: string }[]
        transaction_id: string
        accepting_block_blue_score: string
        is_accepted: boolean
        inputs: Record<string, string>
        block_time: string
    }
}

//TODO rendering etc -> under maintenance
const TransactionLookup: FC = () => {
    return null
    // const [transactionHash, setTransactionHash] = useState('');
    // const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
    // const [loading, setLoading] = useState(false);
    // const [error, setError] = useState<string | null>(null);
    // const {hashRev} = useParams();
    // const navigate = useNavigate();
    //
    // const fetchTransactionData = async (hash: string): Promise<void> => {
    //     if (!hash) return;
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const [krc20Response, revealData] = await Promise.all([
    //             simpleRequest<ResultResponse<OpTransactionData[]>>(`https://api.kasplex.org/v1/krc20/op/${hash}`),
    //             simpleRequest<Transaction>(`https://api.kaspa.org/transactions/${hash}`)
    //         ]);
    //
    //         const krc20Data = krc20Response.result[0];
    //
    //         const commitHash = revealData.inputs?.[0].previous_outpoint_hash;
    //         const commitData = await simpleRequest<TransactionData['commitData']>(`https://api.kaspa.org/transactions/${commitHash}`);
    //
    //         //todo revealData
    //         setTransactionData({krc20Data, revealData, commitData});
    //     } catch (err) {
    //         console.error('Failed to fetch transaction data:', err);
    //         setError('Failed to fetch transaction data. Please check the transaction hash and try again.');
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    //
    // useEffect(() => {
    //     if (hashRev) {
    //         setTransactionHash(hashRev);
    //         void fetchTransactionData(hashRev);
    //     }
    // }, [hashRev]);
    //
    // const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    //     e.preventDefault();
    //     if (transactionHash) {
    //         navigate(`/transaction-lookup/${transactionHash}`);
    //     }
    // };
    //
    // const formatDateTime = (timestamp: string): string => {
    //     return new Date(parseInt(timestamp)).toLocaleString();
    // };
    //
    // const handleAddressClick = (address: string): void => {
    //     navigate(`/wallet/${address}`);
    // };
    //
    // const openExplorerForP2SH = (address: string): void => {
    //     window.open(`https://explorer.kaspa.org/addresses/${address}`, '_blank', 'noopener,noreferrer');
    // };
    //
    // const formatKaspa = (amount: string): string => {
    //     return (parseFloat(amount) / 100000000).toFixed(8) + " KAS";
    // };
    //
    // const formatKRC20Amount = (amount: string, decimals: number) => {
    //     return `${(parseInt(amount) / Math.pow(10, decimals)).toFixed(decimals)} ${transactionData?.krc20Data.tick}`;
    // };
    //
    // const openExplorer = (hash: string): void => {
    //     window.open(`https://explorer.kaspa.org/txs/${hash}`, '_blank', 'noopener,noreferrer');
    // };
    //
    // const copyToClipboard = (text: string): void => {
    //     void navigator.clipboard.writeText(text);
    //     // TODO: Add a toast notification here
    // };
    //
    // const renderTransactionDetails = (data: TransactionData['commitData'], title: string, isCommit: boolean) => (
    //     <Accordion.Item eventKey={isCommit ? "0" : "1"}>
    //         <Accordion.Header>{title}</Accordion.Header>
    //         <Accordion.Body>
    //             <Card className="mb-3">
    //                 <Card.Body>
    //                     <Row className="mb-2">
    //                         <Col sm={4}><strong>Transaction ID</strong></Col>
    //                         <Col sm={8}>
    //             <span className="clickable" onClick={() => openExplorer(data.transaction_id)}>
    //               {data.transaction_id} <FaExternalLinkAlt/>
    //             </span>
    //                             <FaCopy className="ms-2 clickable"
    //                                     onClick={() => copyToClipboard(data.transaction_id)}/>
    //                         </Col>
    //                     </Row>
    //                     <Row className="mb-2">
    //                         <Col sm={4}><strong>Block Time</strong></Col>
    //                         <Col sm={8}>{formatDateTime(data.block_time)}</Col>
    //                     </Row>
    //                     <Row className="mb-2">
    //                         <Col sm={4}><strong>Status</strong></Col>
    //                         <Col sm={8}>
    //                             <Badge bg={data.is_accepted ? "success" : "danger"} className="me-2">
    //                                 {data.is_accepted ? "Accepted" : "Not Accepted"}
    //                             </Badge>
    //                         </Col>
    //                     </Row>
    //                     <Row>
    //                         <Col sm={4}><strong>Block Blue Score</strong></Col>
    //                         <Col sm={8}>{data.accepting_block_blue_score}</Col>
    //                     </Row>
    //                 </Card.Body>
    //             </Card>
    //
    //             <Accordion>
    //                 {renderInputsOutputs(data.inputs, "Inputs", `${isCommit ? 'commit' : 'reveal'}-inputs`)}
    //                 {/*{renderInputsOutputs(data.outputs, "Outputs", `${isCommit ? 'commit' : 'reveal'}-outputs`)}*/}
    //             </Accordion>
    //         </Accordion.Body>
    //     </Accordion.Item>
    // );
    //
    // const renderInputsOutputs = (data: Record<string, string>, title: string, eventKey: string) => (
    //     <Accordion.Item eventKey={eventKey}>
    //         <Accordion.Header>
    //             <strong>{title}</strong> <span className="ms-2">({data.length})</span>
    //         </Accordion.Header>
    //         <Accordion.Body>
    //             {/*{data.map((item, index) => (*/}
    //             {/*    <Card key={index} className="mb-3">*/}
    //             {/*        <Card.Body>*/}
    //             {/*            {item.previous_outpoint_hash && (*/}
    //             {/*                <Row className="mb-2">*/}
    //             {/*                    <Col sm={4}><strong>Previous Outpoint Hash</strong></Col>*/}
    //             {/*                    <Col sm={8}>*/}
    //             {/*    <span className="clickable-address" onClick={() => handleAddressClick(item.previous_outpoint_hash)}>*/}
    //             {/*      {item.previous_outpoint_hash}*/}
    //             {/*    </span>*/}
    //             {/*                    </Col>*/}
    //             {/*                </Row>*/}
    //             {/*            )}*/}
    //             {/*            {item.signature_script && (*/}
    //             {/*                <Row className="mb-2">*/}
    //             {/*                    <Col sm={4}><strong>Signature Script</strong></Col>*/}
    //             {/*                    <Col sm={8}>*/}
    //             {/*                        <div className="signature-script">*/}
    //             {/*                            <span className="script-text">{item.signature_script}</span>*/}
    //             {/*                            <FaCopy*/}
    //             {/*                                className="ms-2 clickable"*/}
    //             {/*                                onClick={() => copyToClipboard(item.signature_script)}*/}
    //             {/*                            />*/}
    //             {/*                        </div>*/}
    //             {/*                    </Col>*/}
    //             {/*                </Row>*/}
    //             {/*            )}*/}
    //             {/*            {item.script_public_key_address && (*/}
    //             {/*                <Row className="mb-2">*/}
    //             {/*                    <Col sm={4}><strong>Address</strong></Col>*/}
    //             {/*                    <Col sm={8}>*/}
    //             {/*    <span className="clickable-address"*/}
    //             {/*          onClick={() => handleAddressClick(item.script_public_key_address)}>*/}
    //             {/*      {item.script_public_key_address}*/}
    //             {/*    </span>*/}
    //             {/*                    </Col>*/}
    //             {/*                </Row>*/}
    //             {/*            )}*/}
    //             {/*            {item.amount && (*/}
    //             {/*                <Row>*/}
    //             {/*                    <Col sm={4}><strong>Amount</strong></Col>*/}
    //             {/*                    <Col sm={8}>{formatKaspa(item.amount)}</Col>*/}
    //             {/*                </Row>*/}
    //             {/*            )}*/}
    //             {/*        </Card.Body>*/}
    //             {/*    </Card>*/}
    //             {/*))}*/}
    //         </Accordion.Body>
    //     </Accordion.Item>
    // );
    //
    // const capitalizeFirstLetter = (string: string): string => {
    //     return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    // };
    //
    // return (
    //     <Container className="transaction-lookup">
    //         <SEO
    //             title="Transaction Lookup"
    //             description="Explore detailed information about KRC-20 token transactions on the Kaspa blockchain."
    //             keywords="KRC-20, Kaspa, transaction lookup, blockchain explorer, token transfers"
    //         />
    //         <JsonLd
    //             data={{
    //                 "@context": "https://schema.org",
    //                 "@type": "WebApplication",
    //                 "name": "KatScan Transaction Lookup",
    //                 "description": "Explore detailed information about KRC-20 token transactions on the Kaspa blockchain.",
    //                 "url": "https://katscan.xyz/transaction-lookup"
    //             }}
    //         />
    //         <h1>Transaction Lookup</h1>
    //         <Form onSubmit={handleSubmit}>
    //             <InputGroup className="mb-3">
    //                 <Form.Control
    //                     type="text"
    //                     placeholder="Enter transaction hash"
    //                     value={transactionHash}
    //                     onChange={(e) => setTransactionHash(e.target.value)}
    //                 />
    //                 <Button variant="primary" type="submit">
    //                     <FaSearch/> Search
    //                 </Button>
    //             </InputGroup>
    //         </Form>
    //
    //         {loading && <LoadingSpinner/>}
    //         {error && <Alert variant="danger">{error}</Alert>}
    //
    //         {transactionData && (
    //             <div className="transaction-details">
    //                 <Card className="mb-4">
    //                     <Card.Header as="h5">KRC-20 Operation Overview</Card.Header>
    //                     <Card.Body>
    //                         <Row className="mb-2">
    //                             <Col sm={4}><strong>Operation</strong></Col>
    //                             <Col sm={8}>{capitalizeFirstLetter(transactionData.krc20Data.op)}</Col>
    //                         </Row>
    //                         <Row className="mb-2">
    //                             <Col sm={4}><strong>Token</strong></Col>
    //                             <Col sm={8}>{transactionData.krc20Data.tick}</Col>
    //                         </Row>
    //                         <Row className="mb-2">
    //                             <Col sm={4}><strong>Amount</strong></Col>
    //                             <Col sm={8}>{formatKRC20Amount(transactionData.krc20Data.amt, 8)}</Col>
    //                         </Row>
    //                         <Row className="mb-2">
    //                             <Col sm={4}><strong>P2SH Address</strong></Col>
    //                             <Col sm={8}>
    //               <span
    //                   className="clickable-address"
    //                   onClick={() => openExplorerForP2SH(transactionData.commitData.outputs[0].script_public_key_address)}
    //               >
    //                 {transactionData.commitData.outputs[0].script_public_key_address}
    //                   <FaExternalLinkAlt className="ms-2"/>
    //               </span>
    //                             </Col>
    //                         </Row>
    //                         <Row className="mb-2">
    //                             <Col sm={4}><strong>Wallet Address</strong></Col>
    //                             <Col sm={8}>
    //               <span className="clickable-address" onClick={() => handleAddressClick(transactionData.krc20Data.to)}>
    //                 {transactionData.krc20Data.to}
    //               </span>
    //                             </Col>
    //                         </Row>
    //                         <Row className="mb-2">
    //                             <Col sm={4}><strong>Transaction Fee</strong></Col>
    //                             <Col sm={8}>{formatKaspa(transactionData.krc20Data.feeRev)}</Col>
    //                         </Row>
    //                         <Row>
    //                             <Col sm={4}><strong>Operation Score</strong></Col>
    //                             <Col sm={8}>{transactionData.krc20Data.opScore}</Col>
    //                         </Row>
    //                     </Card.Body>
    //                 </Card>
    //
    //                 <div className="transaction-flow mb-4">
    //                     <div className="commit-transaction">
    //                         <h6>Commit Transaction</h6>
    //                         <p>{transactionData.commitData.transaction_id}</p>
    //                     </div>
    //                     <FaArrowRight className="flow-arrow"/>
    //                     <div className="reveal-transaction">
    //                         <h6>Reveal Transaction</h6>
    //                         <p>{transactionData.revealData.transaction_id}</p>
    //                     </div>
    //                 </div>
    //
    //                 <Accordion className="mb-4">
    //                     {renderTransactionDetails(transactionData.commitData, "Commit Transaction Details", true)}
    //                     {/*{renderTransactionDetails(transactionData.revealData, "Reveal Transaction Details", false)}*/}
    //                 </Accordion>
    //             </div>
    //         )}
    //     </Container>
    // );
};

export default TransactionLookup;
