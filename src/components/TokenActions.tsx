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

    const internal = () => {
        console.log("click")
    }
    return <DropDownButton>
        <Dropdown.Item onClick={internal}>Jaa</Dropdown.Item>
        <Dropdown.Item onClick={internal}>All</Dropdown.Item>
        <Dropdown.Item onClick={internal}>All</Dropdown.Item>
    </DropDownButton>

}