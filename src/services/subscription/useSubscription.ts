import {useContext, useEffect, useRef} from "react";
import {CallbackType, Methods, SubscriptionsContext} from "./SubscriptionProvider";

export const useSubscription = (table: string, method: Methods, callback: CallbackType, id?: string): void => {
    const {error, subscribe, unsubscribe} = useContext(SubscriptionsContext)
    const uuid = useRef(crypto.randomUUID()).current

    useEffect(() => {
        if (error) {
            console.log("cant connect to subscription, client is not working")
            return
        }
        if (!table || !method || !callback) {
            return
        }
        subscribe(table, method, callback, uuid, id)

        return () => {
            unsubscribe(table, method, uuid, id)
        }
    }, [error, subscribe, unsubscribe, table, method, callback, id, uuid]);
}