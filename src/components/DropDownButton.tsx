import React, {FC, PropsWithChildren} from 'react'
import {HiDotsHorizontal} from "react-icons/hi";
import {CustomDropdown} from "nacho-component-library";
import './DrowDownButton.css'

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
