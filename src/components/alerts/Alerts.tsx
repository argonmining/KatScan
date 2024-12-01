import React, {FC, useEffect, useState} from "react";
import './Alerts.css'
import {uniqueId} from 'lodash'
import {TextContainer} from "../TextContainer";

interface Alert {
    message: string
    type: 'error' | 'warning' | 'success'
    id?: string
}

interface AlertEvent extends CustomEvent {
    detail: Alert
}

export const addAlert = (entry: Alert): void => {
    document.dispatchEvent(new CustomEvent('alertprovider', {detail: entry}))
}
export const Alerts: FC = () => {

    const [entries, setEntries] = useState<Alert[]>([])

    useEffect(() => {
        const removeAlert = (id: string) => {
            setEntries(current => (current.filter(single => id !== single.id)))
        }
        const addAlert = (e: Event) => {
            const alert = (e as AlertEvent).detail
            const id = uniqueId()
            setEntries(current => ([...current, {...alert, id: id}]))
            setTimeout(() => removeAlert(id), 5000)
        }

        document.addEventListener('alertprovider', addAlert)
        return () => document.removeEventListener('alertprovider', addAlert)
    }, [])

    return <>
        <div className={'alert-window'}>
            {
                entries.map(single =>
                    <TextContainer key={single.id}
                                   text={single.message}
                                   customClasses={`alert-single ${single.type}`}/>
                )
            }
        </div>
    </>
}
