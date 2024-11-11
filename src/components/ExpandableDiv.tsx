import React, {FC, PropsWithChildren, ReactNode, useState} from "react";
import {FaChevronDown, FaChevronUp} from "react-icons/fa";
import '../styles/components/ExpandableDiv.css'

type Props = {
    title?: string | ReactNode
}

export const ExpandableDiv: FC<PropsWithChildren<Props>> = (
    {
        title,
        children
    }
) => {
    const [isExtended, setIsExtended] = useState<boolean>()
    return <div className={'expandable-div'}>
        <div className={`expandable-div-header ${isExtended ? 'extended' : ''}`}
             onClick={() => setIsExtended(current => !current)}>
            {title && typeof title === 'object' ? title : <span>{title}</span>}
            {isExtended ? <FaChevronUp/> : <FaChevronDown/>}
        </div>
        {isExtended && <div className={'expandable-div-body'}>{children}</div>}
    </div>
}