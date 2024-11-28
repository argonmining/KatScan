import React, {FC, PropsWithChildren} from 'react'
import {HiDotsHorizontal} from "react-icons/hi";
import './DrowDownButton.css'
import {CustomDropdown} from "./customDropdown/CustomDropdown";

export const DropDownButton: FC<PropsWithChildren> = (
    {
        children
    }
) => {
    return <CustomDropdown className={"dropdown-button"}
                           title={<HiDotsHorizontal/>}>
        {children}
    </CustomDropdown>
}
