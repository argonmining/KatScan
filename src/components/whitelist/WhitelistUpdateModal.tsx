import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { whitelistUpdateService } from '../../services/whitelistUpdateService';
import { addAlert } from '../alerts/Alerts';
import { useDarkMode } from 'nacho-component-library';
import { copyToClipboard } from '../../services/Helper';
import { QRCodeSVG } from 'qrcode.react';
import '../../styles/whitelist/WhitelistUpdateModal.css';

interface WhitelistUpdateModalProps {
    show: boolean;
    onClose: () => void;
    whitelistData: {
        id: string;
        address: string;
    };
    onSuccess: () => void;
}

export const WhitelistUpdateModal: React.FC<WhitelistUpdateModalProps> = ({
    show,
    onClose,
    whitelistData,
    onSuccess
}) => {
    const { isDarkMode } = useDarkMode();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [feeData, setFeeData] = useState<{
        amount: string;
        amountInKAS: string;
        feeWallet: string;
    } | null>(null);
    const [formData, setFormData] = useState({
        txnID: '',
        newAddress: ''
    });

    useEffect(() => {
        if (show) {
            setLoading(true);
            void whitelistUpdateService.getFee()
                .then(response => {
                    console.log('Fee API Response:', response);
                    if (response && response.amount && response.amountInKAS && response.feeWallet) {
                        setFeeData(response);
                        console.log('Set Fee Data:', response);
                    } else {
                        console.error('Invalid API response structure:', response);
                        addAlert('error', 'Invalid fee information received');
                    }
                })
                .catch((error) => {
                    console.error('Fee API Error:', error);
                    addAlert('error', 'Failed to fetch fee information');
                })
                .finally(() => setLoading(false));
        }
    }, [show]);

    // Debug render
    console.log('Current Fee Data:', feeData);
    console.log('Loading State:', loading);

    const handleSubmit = async () => {
        if (!feeData) return;
        
        setLoading(true);
        try {
            await whitelistUpdateService.updateWhitelist({
                feeAmount: feeData.amount,
                feeAddress: feeData.feeWallet,
                oldAddress: whitelistData.address,
                newAddress: formData.newAddress,
                whitelistID: whitelistData.id,
                txnID: formData.txnID
            });
            addAlert('success', 'Whitelist updated successfully!');
            onSuccess();
            onClose();
        } catch (error) {
            addAlert('error', 'Failed to update whitelist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            show={show} 
            onHide={onClose}
            centered
            className="whitelist-update-modal"
            size="lg"
        >
            <Modal.Header closeButton data-bs-theme={isDarkMode ? 'dark' : 'light'}>
                <Modal.Title>
                    {step === 1 ? 'Update Whitelist Address' : 'Validate Transaction'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading && <div className="loading-overlay">Loading...</div>}
                
                {step === 1 ? (
                    <div className="info-section">
                        <p><strong>Whitelist Spot ID:</strong> {whitelistData.id}</p>
                        <p><strong>Current WL Address:</strong> {whitelistData.address}</p>
                        <p><strong>Update Fee Amount:</strong> {feeData ? `${feeData.amountInKAS} KAS` : 'Loading...'}</p>
                        <p><strong>Send to:</strong> <span className="fee-wallet">{feeData ? feeData.feeWallet : 'Loading...'}</span></p>
                        
                        {feeData && feeData.feeWallet && (
                            <div className="qr-section">
                                <QRCodeSVG
                                    value={feeData.feeWallet}
                                    size={200}
                                    level="H"
                                    className="qr-code-image"
                                    includeMargin={true}
                                />
                            </div>
                        )}
                        
                        <div className="button-section">
                            <Button 
                                variant="outline-primary"
                                onClick={() => void copyToClipboard(feeData?.feeWallet || '')}
                                disabled={!feeData?.feeWallet}
                            >
                                Copy Address
                            </Button>
                            <Button 
                                variant="outline-primary"
                                onClick={() => void copyToClipboard(feeData?.amountInKAS || '')}
                                disabled={!feeData?.amountInKAS}
                            >
                                Copy Amount
                            </Button>
                        </div>
                        
                        <p className="instructions">
                            We need to validate you own the wallet you are trying to update.<br/>
                            Send <strong>{feeData ? `${feeData.amountInKAS} KAS` : 'Loading...'}</strong> to the address above to verify and then click Next.
                        </p>
                    </div>
                ) : (
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Transaction ID</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.txnID}
                                onChange={(e) => setFormData(prev => ({ ...prev, txnID: e.target.value }))}
                            />
                        </Form.Group>
                        
                        <Form.Group className="mb-3">
                            <Form.Label>New Wallet Address</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.newAddress}
                                onChange={(e) => setFormData(prev => ({ ...prev, newAddress: e.target.value }))}
                            />
                        </Form.Group>
                    </Form>
                )}
            </Modal.Body>
            <Modal.Footer>
                {step === 1 ? (
                    <Button onClick={() => setStep(2)}>Next</Button>
                ) : (
                    <>
                        <Button variant="secondary" onClick={() => setStep(1)}>
                            Back
                        </Button>
                        <Button 
                            variant="primary"
                            onClick={() => void handleSubmit()}
                            disabled={!formData.txnID || !formData.newAddress}
                        >
                            Submit
                        </Button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
}; 