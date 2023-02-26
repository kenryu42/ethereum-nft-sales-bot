import type { Market } from '../types';

const doops: { [key: string]: Market } = {
    // Dooplicator Contract
    '0x36c3ec16da484240f74d05c0213186a3248e0e48': {
        name: 'dooplicator',
        displayName: 'Dooplicator',
        color: '#b6b9fe',
        site: 'https://opensea.io/assets/',
        accountPage: 'https://opensea.io/',
        iconURL: 'https://pbs.twimg.com/profile_images/1484416288097116160/xLR2e4eu_400x400.png',
        logDecoder: []
    },
    // Dooplicator Marketplace Contract
    '0xcdef9b7949869cbeddcaeb398445e5972d8f564c': {
        name: 'dooplicator-marketplace',
        displayName: 'Dooplicator Market',
        color: '#dbff00',
        site: 'https://etherscan.io/tx/',
        accountPage: 'https://opensea.io/',
        iconURL: 'https://pbs.twimg.com/profile_images/1484416288097116160/xLR2e4eu_400x400.png',
        logDecoder: []
    }
};

export { doops };
