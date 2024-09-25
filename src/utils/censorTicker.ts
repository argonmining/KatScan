export const censorTicker = (ticker: string): string => {
    const offensiveWords: Record<string, string> = {
        'NIGGA': 'N***A',
        'NIGGAS': 'N****S',
        'NIGGER': 'N****R',
        'RETARD': 'R****D',
        'FAG': 'F**',
        'FAGS': 'F**S',
        'FAGGOT': 'F****T',
        'DYKE': 'D**E',
        'DYKES': 'D**ES',
        'TRANNY': 'T****Y',
        'SPIC': 'S**C',
        'SPICS': 'S**CS',
        'KIKE': 'K**E',
        'KIKES': 'K***S',
        'CHINK': 'C***K',
        'CHINKS': 'C***KS',
        'GOOK': 'G**K',
        'GOOKS': 'G**KS',
        'WOP': 'W**',
        'WOPS': 'W**S',
        'TARD': 'T**D'
    };
    return offensiveWords[ticker] || ticker;
};
