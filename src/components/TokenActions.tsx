import React, {FC} from 'react'
import {TokenData} from "../interfaces/TokenData";
import {FaExchangeAlt} from "react-icons/fa";
import {CustomDropdownItem, IconDropdownButton} from "nacho-component-library";

type Props = {
    tokenDetail: TokenData
}
export const TokenActions: FC<Props> = (
    {
        tokenDetail
    }
) => {
    const mintedOut = tokenDetail.max - tokenDetail.minted === 0

    const openBot = () => {
        window.open(`https://t.me/kspr_home_bot?start=nacho`, '_blank')
    }
    return <IconDropdownButton title={<FaExchangeAlt/>} theme={'header'}>
        <CustomDropdownItem onClick={openBot}>
            {`Trade ${tokenDetail.tick.toUpperCase()} on KSPR Bot`}
        </CustomDropdownItem>
        {!mintedOut && <CustomDropdownItem onClick={openBot}>
            {`Mint ${tokenDetail.tick.toUpperCase()} on KSPR Bot`}
        </CustomDropdownItem>}
    </IconDropdownButton>

}