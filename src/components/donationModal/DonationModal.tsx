import React, {FC} from "react";
import {Button, Modal} from "react-bootstrap";
import communityQR from "../../assets/communityQR.png";
import devQR from "../../assets/devQr.png";
import {CustomTabs, useDarkMode} from "nacho-component-library";
import {copyToClipboard} from "../../services/Helper";
import './DonationModal.css'
import {BasicModal} from "../modal/BasicModal";

type Props = {
    show: boolean
    close: () => void
}

const communityAddress = 'kaspa:qrlk2f25g4clhzhadd26u502rqfn287y59mm2tj5k6mwamgp2jzkg904jfrc6'

const devAddress = 'kaspa:qrtsw8lkquppuurmy9zrjdgpgdthfall90ve06yw88vc9dzmr26wqvz3vlqt9'
export const DonationModal: FC<Props> = (
    {
        show,
        close
    }
) => {
    const {isDarkMode} = useDarkMode()
    return <BasicModal show={show} close={close} title={'Donate'} customClass={'donate-modal'}>
        <CustomTabs titles={['Community', 'Dev Coffee tip']}>
            <Modal.Body className="text-center">
                <p>
                    This Wallet is used for the community, for example listings.
                </p>
                <p>
                    Send only Kaspa network assets to this address
                </p>
                <img
                    src={communityQR as string}
                    alt="Donate Community QR Code"
                    className="qr-code-image"
                />
                <p className="address-text">
                    {communityAddress}
                </p>
                <Button variant={isDarkMode ? 'outline-light' : 'outline-secondary'}
                        onClick={() => copyToClipboard(communityAddress)}>
                    Copy address
                </Button>
            </Modal.Body>

            <Modal.Body className="text-center">
                <p>
                    This Wallet is used for the DEVs of KATSCAN, to buy some coffee.
                </p>
                <p>
                    Send only Kaspa network assets to this address
                </p>
                <img
                    src={devQR as string}
                    alt="Donate Devs QR Code"
                    className="qr-code-image"
                />
                <p className="address-text">
                    {devAddress}
                </p>
                <Button variant={isDarkMode ? 'outline-light' : 'outline-secondary'}
                        onClick={() =>
                            copyToClipboard(devAddress)}>
                    Copy address
                </Button>
            </Modal.Body>
        </CustomTabs>
    </BasicModal>
}