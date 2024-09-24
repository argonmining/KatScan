export const parseRawNumber = (rawNumber: string, decimals: number): number => {
    return Number(rawNumber) / Math.pow(10, decimals);
};

export const formatNumber = (rawNumber: number, decimals: number): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
    }).format(rawNumber);
};

export const formatDateTime = (timestamp: string): string => {
    const date = new Date(parseInt(timestamp));
    return date.toLocaleString('en-US', {timeZoneName: 'short'});
};