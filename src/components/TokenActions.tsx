import React, {FC} from 'react'
import {DropDownButton} from "./DropDownButton";
import {Dropdown} from "react-bootstrap";

export const TokenActions:FC = () => {

    const openBot = () => {
        window.open(`https://t.me/kspr_home_bot?start=nacho`, '_blank')
    }
    return <DropDownButton>
        <Dropdown.Item onClick={openBot}>KSPR Bot</Dropdown.Item>
    </DropDownButton>

}