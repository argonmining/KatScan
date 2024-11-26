import React, {FC} from 'react'
import {DropDownButton} from "./DropDownButton";
import {Dropdown} from "react-bootstrap";

type Props = {
    ticker: string
}
export const TokenActions: FC<Props> = (
    {
        ticker
    }
) => {

    const openBot = () => {
        window.open(`https://t.me/kspr_home_bot?start=nacho`, '_blank')
    }
    return <DropDownButton>
        <Dropdown.Item onClick={openBot}>KSPR Bot</Dropdown.Item>
    </DropDownButton>

}