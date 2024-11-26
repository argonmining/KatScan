// Helper function for number formatting
export const formatNumber = (number: number | string, maxDigits = 5): string => {
    const internalNumber = typeof number === 'string' ? parsingNumber(number) : number
    if (internalNumber === 0){
        return '0'
    }
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDigits,
    }).format(internalNumber);
}

export const formatInteger = (num: number |string): string => {
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
    if (!rawNumber){
        return 0
    }
    return Number(rawNumber) / Math.pow(10, decimals);
}

export const formatDateTime = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString('en-US', {timeZoneName: 'short'});
}

export const copyToClipboard = (text: string): void => {
    void navigator.clipboard.writeText(text);
    // TODO: Add a toast notification here
}

export const formatKaspa = (amount: string): string => {
    return (parseFloat(amount) / 100000000).toFixed(8) + " KAS";
}

export const formatKRC20Amount = (amount: string, decimals: number, tick: string): string => {
    if (!amount || amount === '0'){
        return '0'
    }
    return `${parseRawNumber(amount, decimals).toFixed(decimals)} ${tick}`;
}

export const openTransaction = (transactionId: string): void => {
    window.open(`https://explorer.kaspa.org/txs/${transactionId}`, '_blank', 'noopener,noreferrer');
};