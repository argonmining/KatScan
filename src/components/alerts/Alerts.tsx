import React, {FC, useEffect, useState} from "react";
import './Alerts.css'
import {uniqueId} from 'lodash'
import {TextContainer} from "../TextContainer";
import {Image} from "nacho-component-library";
import error from "../../assets/nacho-error.jpg";
import success from "../../assets/nacho-success.jpg";

interface Alert {
    message: string
    type: 'error' | 'warning' | 'success'
    id?: string
}

interface AlertEvent extends CustomEvent {
    detail: Alert
}

export const addAlert = (type: Alert['type'], message: Alert['message']): void => {
    document.dispatchEvent(new CustomEvent('alertprovider', {detail: {type, message}}))
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
            setTimeout(() => removeAlert(id), 4000)
        }

        document.addEventListener('alertprovider', addAlert)
        return () => document.removeEventListener('alertprovider', addAlert)
    }, [])

    return <>
        <div className={'alert-window'}>
            {
                entries.map(single => <div key={single.id} className={'alert-wrapper'}>
                        {single.type === 'error'
                            ? <Image alt={"something went wrong"} src={error as string}/>
                            : <Image alt={"success"} src={success as string}/>
                        }
                        <TextContainer text={single.message}
                                       customClasses={`alert-single ${single.type}`}/>
                    </div>
                )
            }
        </div>
    </>
}
