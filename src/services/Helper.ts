import {addAlert} from "../components/alerts/Alerts";
import {Message} from "@stomp/stompjs";
import {SubscriptionWrapper} from "../interfaces/SubscriptionWrapper";

// Helper function for number formatting
export const formatNumber = (number: number | string, maxDigits = 5): string => {
    const internalNumber = typeof number === 'string' ? parsingNumber(number) : number
    if (internalNumber === 0) {
        return '0'
    }
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDigits,
    }).format(internalNumber);
}

export const formatInteger = (num: number | string): string => {
    const internalNumber = typeof num === 'string' ? parseInt(num) : num
    if (isNaN(internalNumber)) {
        return 'N/A';
    }
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(internalNumber);
};

export const shortenString = (str: number | string, startLength = 5, endLength = 5): string => {
    const internalString = typeof str === 'string' ? str : String(str)

    if (internalString.length <= startLength + endLength) {
        return internalString
    }

    return `${internalString.slice(0, startLength)}...${internalString.slice(-endLength)}`;
}

const parsingNumber = (value: string): number => {
    return value.includes('.') ? parseFloat(value) : parseInt(value)
}

export const parseRawNumber = (rawNumber: string | number, decimals: number): number => {
    if (!rawNumber) {
        return 0
    }
    return Number(rawNumber) / Math.pow(10, decimals);
}

export const formatDateTime = (timestamp: string | number): string => {
    let internalTimestamp = timestamp;
    if (typeof timestamp === 'string') {
        internalTimestamp = parseInt(timestamp)
    }
    const date = new Date(internalTimestamp);
    return date.toLocaleString('en-US', {timeZoneName: 'short'});
}

export const copyToClipboard = (text: string): void => {
    void navigator.clipboard.writeText(text);
    addAlert('success', 'Text copied')
}

export const formatKaspa = (amount: string): string => {
    return (parseFloat(amount) / 100000000).toFixed(8) + " KAS";
}

export const formatKRC20Amount = (amount: number, decimals: number, tick: string): string => {
    if (!amount || amount === 0) {
        return '0'
    }
    return `${parseRawNumber(amount, decimals).toFixed(decimals)} ${tick}`;
}

export const openTransaction = (transactionId: string): void => {
    window.open(`https://explorer.kaspa.org/txs/${transactionId}`, '_blank', 'noopener,noreferrer');
};

export const openLink = (url: string): void => {
    window.open(url, '_blank', 'noopener,noreferrer');
};

export const sortComparison = <T extends number | string>(a: T, b: T, sortDirection: 'asc' | 'desc'): number => {
    if (typeof a === 'number' && typeof b === 'number') {
        if (sortDirection === 'desc') {
            return b - a
        }
        return a - b
    }
    if (sortDirection === 'desc') {
        return String(b).localeCompare(String(a))
    }
    return String(a).localeCompare(String(b))
}

export function getSubscriptionContent<T>(message: Message): T {
    return (JSON.parse(message.body) as SubscriptionWrapper<T>).content
}