import React, {FC} from "react";
import {Badge, Card, Col, Row} from "react-bootstrap";
import {FaCopy, FaExternalLinkAlt} from "react-icons/fa";
import {TransactionData} from "../../pages/TransactionLookup";
import {copyToClipboard, formatDateTime, formatKaspa, openTransaction} from "../../services/Helper";
import {Link} from "react-router-dom";
import {ExpandableDiv} from "nacho-component-library";

type TransactionDetails = {
    data: TransactionData['commitData']
    title: string
}
export const TransactionDetails: FC<TransactionDetails> = (
    {
        data,
        title
    }
) => (
    <div className="mb-4">
        <ExpandableDiv title={title}>
            <Card className="mb-3">
                <Card.Body>
                    <Row className="mb-2">
                        <Col sm={4}><strong>Transaction ID</strong></Col>
                        <Col sm={8}>
                <span className="clickable" onClick={() => openTransaction(data.transaction_id)}>
                  {data.transaction_id} <FaExternalLinkAlt/>
                </span>
                            <FaCopy className="ms-2 clickable"
                                    onClick={() => copyToClipboard(data.transaction_id)}/>
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col sm={4}><strong>Block Time</strong></Col>
                        <Col sm={8}>{formatDateTime(data.block_time)}</Col>
                    </Row>
                    <Row className="mb-2">
                        <Col sm={4}><strong>Status</strong></Col>
                        <Col sm={8}>
                            <Badge bg={data.is_accepted ? "success" : "danger"} className="me-2">
                                {data.is_accepted ? "Accepted" : "Not Accepted"}
                            </Badge>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={4}><strong>Block Blue Score</strong></Col>
                        <Col sm={8}>{data.accepting_block_blue_score}</Col>
                    </Row>
                </Card.Body>
            </Card>

            <TransactionInputsOutputs data={data.inputs} title={'Inputs'}/>
            <TransactionInputsOutputs data={data.outputs} title={'Outputs'}/>
        </ExpandableDiv>
    </div>
);

type TransactionInputsOutputs = {
    data: Record<string, string>[]
    title: string
}
const TransactionInputsOutputs: FC<TransactionInputsOutputs> = (
    {
        data,
        title
    }
) => (
    <ExpandableDiv title={<span className="ms-2"><strong>{title}</strong> ({data.length})</span>}>
        {data.map((item, index) => (
            <Card key={index} className="mb-3">
                <Card.Body>
                    {item.previous_outpoint_hash && (
                        <Row className="mb-2">
                            <Col sm={4}><strong>Previous Outpoint Hash</strong></Col>
                            <Col sm={8}>
                                <Link to={`/wallet/${item.previous_outpoint_hash}`} className={'clickable-address'}>
                                    {item.previous_outpoint_hash}
                                </Link>
                            </Col>
                        </Row>
                    )}
                    {item.signature_script && (
                        <Row className="mb-2">
                            <Col sm={4}><strong>Signature Script</strong></Col>
                            <Col sm={8}>
                                <div className="signature-script">
                                    <span className="script-text">{item.signature_script}</span>
                                    <FaCopy
                                        className="ms-2 clickable"
                                        onClick={() => copyToClipboard(item.signature_script)}
                                    />
                                </div>
                            </Col>
                        </Row>
                    )}
                    {item.script_public_key_address && (
                        <Row className="mb-2">
                            <Col sm={4}><strong>Address</strong></Col>
                            <Col sm={8}>
                                <Link to={`/wallet/${item.script_public_key_address}`}
                                      className={'clickable-address'}>
                                    {item.script_public_key_address}
                                </Link>
                            </Col>
                        </Row>
                    )}
                    {item.amount && (
                        <Row>
                            <Col sm={4}><strong>Amount</strong></Col>
                            <Col sm={8}>{formatKaspa(item.amount)}</Col>
                        </Row>
                    )}
                </Card.Body>
            </Card>
        ))}
    </ExpandableDiv>
);