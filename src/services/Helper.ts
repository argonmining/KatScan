// Helper function for number formatting
export const formatNumber = (number: number | string, maxDigits = 5): string => {
    const internalNumber = typeof number === 'string' ? parsingNumber(number) : number
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDigits,
    }).format(internalNumber);
};

export const shortenString = (str: number | string, startLength = 5, endLength = 5): string => {
    const internalString = typeof str === 'string' ? str : String(str)

    if (internalString.length <= startLength + endLength) {
        return internalString
    }

    return `${internalString.slice(0, startLength)}...${internalString.slice(-endLength)}`;
};

const parsingNumber = (value: string): number => {
    return value.includes('.') ? parseFloat(value) : parseInt(value)
}

export const parseRawNumber = (rawNumber: string, decimals: number): number => {
    return Number(rawNumber) / Math.pow(10, decimals);
};

export const formatDateTime = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString('en-US', {timeZoneName: 'short'});
};