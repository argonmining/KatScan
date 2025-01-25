import React, {useEffect, useState, createContext, FC, PropsWithChildren, useContext} from "react";
import {Client} from "@stomp/stompjs";
import {katscanBaseUrl} from "../../utils/StaticVariables";
import SockJS from "sockjs-client";


const SubscriptionsContext = createContext({
    stompClient: null
})

export const DarkModeProvider: FC<PropsWithChildren> = ({children}) => {
    const [message, setMessage] = useState('');
    const [name, setName] = useState('');
    const [stompClient, setStompClient] = useState<Client | null>(null);
    // todo edit to provider and build a useSubscriptions
    useEffect(() => {
        const socket = new SockJS(`${katscanBaseUrl}/ws`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (str) => {
                console.log(str);
            },
            onConnect: () => {
                console.log('Connected to WebSocket');
                stompClient.subscribe('/multicast/Whitelist/update', (response) => {
                    console.log('Received message:', response.body);
                    setMessage(JSON.parse(response.body).content);
                });
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message'])
                console.error('Additional details: ' + frame.body)
            }
        })

        stompClient.activate();
        setStompClient(stompClient)

        return () => {
            stompClient.deactivate();
        };
    }, []);

    return <SubscriptionsContext.Provider value={{isDarkMode, toggleDarkMode}}>
        {children}
    </SubscriptionsContext.Provider>
}

export const useDarkMode = (): { toggleDarkMode: () => void, isDarkMode: boolean } => {
    const {isDarkMode, toggleDarkMode} = useContext(SubscriptionsContext)

    return {isDarkMode, toggleDarkMode}
}