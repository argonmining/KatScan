import React, {createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useRef, useState} from "react";
import {Client, Message, StompSubscription} from "@stomp/stompjs";
import {katscanBaseUrl} from "../../utils/StaticVariables";
import SockJS from "sockjs-client";
import {uniqueId} from "lodash";

type Methods = 'update' | 'insert' | 'delete'
type CallbackType = (message: Message) => void
type ContextType = {
    // stompClient: React.MutableRefObject<Client | null>
    error: boolean
    subscribe: (table: string, method: Methods, callback: CallbackType, uuid: string, id?: string) => void
    unsubscribe: (table: string, method: Methods, uuid: string, id?: string) => void
}

const SubscriptionsContext = createContext<ContextType>({
    error: false,
    subscribe: () => undefined,
    unsubscribe: () => undefined
})
type Callback = (message: Message) => void
type Registry = {
    update: Record<string, Record<string, Callback | Record<string, Callback>>>
    delete: Record<string, Record<string, Callback | Record<string, Callback>>>
    insert: Record<string, Record<string, Callback>>
}
type SubRegistry = {
    update: Record<string, StompSubscription | undefined>
    delete: Record<string, StompSubscription | undefined>
    insert: Record<string, StompSubscription | undefined>
}

type SubscriptionWrapper = {
    table: string
    method: Methods
    content: Record<'id' | string, unknown>
}

export const SubscriptionProvider: FC<PropsWithChildren> = ({children}) => {
    const [error, setError] = useState(false);
    const stompClient = useRef<Client | null>(null);
    const registry = useRef<Registry>({
        insert: {},
        update: {},
        delete: {}
    })
    const subRegistry = useRef<SubRegistry>({
        insert: {},
        update: {},
        delete: {}
    })

    useEffect(() => {
        const socket = new SockJS(`${katscanBaseUrl}/ws`);
        stompClient.current = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 2000,
            heartbeatIncoming: 10000,
            heartbeatOutgoing: 10000,
            onConnect: () => {
                console.log('Connected to WebSocket');
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message'])
                console.error('Additional details: ' + frame.body)
                setError(true)
            }
        })
        stompClient.current?.activate();

        return () => {
            stompClient.current?.deactivate();
        };
    }, []);

    const insertSubscriptiption = useCallback((message: Message) => {
        const body = JSON.parse(message.body) as SubscriptionWrapper
        if (registry.current['insert'][body.table]) {
            Object.values(registry.current['insert'][body.table]).forEach(single => single(message))
        }
    }, [])

    const updateAndDeleteSubscriptiption = useCallback((message: Message) => {
        const body = JSON.parse(message.body) as SubscriptionWrapper
        if (registry.current[body.method][body.table]) {
            if (body.content['id']) {
                const idReg = registry.current[body.method][body.table][body.content['id'].toString()] as Record<string, Callback> | undefined
                if (idReg) {
                    Object.values(idReg).forEach(single => single(message))
                }
                Object.entries(registry.current[body.method][body.table]).forEach(([key, value])=>{
                    if (key !== (body.content['id'].toString())){

                    }
                })
            }
            Object.values(registry.current[body.method][body.table]).forEach(single => single(message))
        }
    }, [])

    const subscribe = useCallback((table: string, method: Methods, callback: CallbackType, uuid: string, id?: string): void => {
        if (registry.current[method][table] === undefined) {
            registry.current[method][table] = {}
        }
        if (method === 'insert') {
            if (Object.keys(registry.current[method][table]).length === 0) {
                subRegistry.current[method][table] = stompClient.current?.subscribe(`/multicast/${table}/insert`, insertSubscriptiption)
            }
            //on insert we dont have an id subscription
            registry.current[method][table][uuid] = callback
            return
        }
        if (id) {
            if (registry.current[method][table][id] === undefined) {
                registry.current[method][table][id] = {}
            }
            (registry.current[method][table][id] as Record<string, Callback>)[uuid] = callback
        }
        if (Object.keys(registry.current[method][table]).length === 0) {
            subRegistry.current[method][table] = stompClient.current?.subscribe(`/multicast/${table}/${method}`, updateAndDeleteSubscriptiption)
        }
        registry.current[method][table][uuid] = callback
    }, [insertSubscriptiption, updateAndDeleteSubscriptiption])


    const unsubscribe = useCallback((table: string, method: Methods, uuid: string, id?: string): void => {
        if (id) {
            delete (registry.current[method][table][id] as Record<string, Callback>)[uuid]
            if (Object.keys(registry.current[method][table][id]).length === 0) {
                delete registry.current[method][table][id]
            }
        } else {
            delete registry.current[method][table][uuid]
        }

        if (Object.keys(registry.current[method][table]).length === 0) {
            subRegistry.current[method][table]?.unsubscribe()
            delete subRegistry.current[method][table]
        }
    }, [])

    return <SubscriptionsContext.Provider value={{error, subscribe, unsubscribe}}>
        {children}
    </SubscriptionsContext.Provider>
}

export const useSubscription = (table: string, method: Methods, callback: CallbackType, id?: string) => {
    const {error, subscribe, unsubscribe} = useContext(SubscriptionsContext)
    const uuid = useRef(uniqueId()).current

    useEffect(() => {
        if (error) {
            console.log("cant connect to subscription, client is not working")
            return
        }
        if (stompClient.current) {

        }

    }, [error, stompClient]);
}