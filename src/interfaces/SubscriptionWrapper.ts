import {Methods} from "../services/subscription/SubscriptionProvider";

export type SubscriptionWrapper<T> = {
    table: string
    method: Methods
    content: T
}