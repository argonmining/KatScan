import React from "react";
import {Spinner} from "react-bootstrap";
import {FC} from "react";

type Props = {
    useFlexHeight?: boolean
}
export const LoadingSpinner:FC<Props> = ({useFlexHeight = false}) => {
    return <div
        style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...(useFlexHeight ? {flex: 1} : {height: '100%'})
        }}>
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </div>
}