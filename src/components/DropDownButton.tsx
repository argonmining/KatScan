import React, {FC, PropsWithChildren, useEffect, useState} from 'react'
import {HiDotsHorizontal} from "react-icons/hi";
import './DrowDownButton.css'
import {Dropdown} from "react-bootstrap";

export const DropDownButton: FC<PropsWithChildren> = (
    {
        children
    }
) => {
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        console.log("test")
    }, [showDropdown]);

    return <Dropdown className={"dropdown-button"}
                     show={showDropdown}
                     onToggle={() => setShowDropdown(current => !current)}>
        <Dropdown.Toggle as="div" className="dropdown-toggle">
            <HiDotsHorizontal/>
        </Dropdown.Toggle>
        <Dropdown.Menu >
            {children}
        </Dropdown.Menu>
    </Dropdown>
}
