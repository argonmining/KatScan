import React, {FC, PropsWithChildren, ReactElement, useRef, useState} from "react";
import {Dropdown} from "react-bootstrap";
import {createPortal} from "react-dom";
import './CustomDropdown.css'

type Props = {
    title: string | ReactElement
    className?: string
}

export const CustomDropdown: FC<PropsWithChildren<Props>> = (
    {
        title,
        className,
        children
    }
) => {
    const [showLaunchTypeDropdown, setShowLaunchTypeDropdown] = useState(false)
    const container = document.getElementById('portal-container')
    const dRef = useRef<HTMLDivElement | null>(null)

    if (container === null) {
        return null
    }

    return <Dropdown show={showLaunchTypeDropdown}
                     className={`custom-dropdown ${className ?? ''}`}
                     ref={dRef}
                     onToggle={() => setShowLaunchTypeDropdown(!showLaunchTypeDropdown)}>
        <Dropdown.Toggle as="div" className="dropdown-header">
            {title}
        </Dropdown.Toggle>
        {showLaunchTypeDropdown
            ? createPortal(<div style={{position: 'relative', width: 0, height: 0}}>
                <div style={{
                    position: "absolute",
                    left: dRef.current?.clientLeft,
                    top: dRef.current?.clientTop
                }}
                     className={`custom-dropdown ${className ?? ''}`}>
                    <Dropdown.Menu>
                        {children}
                    </Dropdown.Menu>
                </div>
            </div>, container)
            : null
        }
    </Dropdown>
}