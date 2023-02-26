import 'dotenv/config';
import ABI from '../abi/transferEvent.json' assert { type: 'json' };
import SUDOSWAP_ABI from '../abi/sudoSwap.json' assert { type: 'json' };
import DOOP_ABI from '../abi/dooplicationContract.json' assert { type: 'json' };
import DOOPMARKET_ABI from '../abi/dooplicationMarketplaceContract.json' assert { type: 'json' };
import DOOPPROXY_ABI from '../abi/dooplicationMarketplaceProxyContract.json' assert { type: 'json' };
import { Network, Alchemy } from 'alchemy-sdk';

// Required settings
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
    ? process.env.CONTRACT_ADDRESS.toLowerCase()
    : '';
const CONTRACT_ADDRESSES = process.env.CONTRACT_ADDRESSES
    ? process.env.CONTRACT_ADDRESSES.toLowerCase()
    : '';
const DOOP_ADDRESSES = process.env.DOOP_ADDRESSES ? process.env.DOOP_ADDRESSES.toLowerCase() : '';
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || '';
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || '';

// Optional settings
const TOKEN_TYPE = process.env.TOKEN_TYPE || '';
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY || '';

const DEFAULT_NFT_API = OPENSEA_API_KEY ? 'Opensea' : 'Alchemy';

// Image size for the GIF
const GIF_ENABLED = true;
const GIF_DURATION = 1500;
const IMAGE_WIDTH = 500;

// Alchemy sdk setup
const settings = {
    apiKey: ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET
};
const alchemy = new Alchemy(settings);

// Twitter api settings if enable (optional)
const TWITTER_ENABLED = process.env.TWITTER_ENABLED === '1';
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || '';
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || '';
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN || '';
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET || '';

// Discord webhook settings if enable (optional)
const DISCORD_ENABLED = process.env.DISCORD_ENABLED === '1';
const WEBHOOK_1 = process.env.WEBHOOK_URL || '';
const WEBHOOK_URLS = [WEBHOOK_1].filter((url) => url !== '');

// Error handler for configuration
(() => {
    const config = {
        CONTRACT: [CONTRACT_ADDRESS, CONTRACT_ADDRESSES],
        ALCHEMY_API_KEY: ALCHEMY_API_KEY,
        ETHERSCAN_API_KEY: ETHERSCAN_API_KEY,
        WEBHOOK_URL: DISCORD_ENABLED ? WEBHOOK_1 : 'Disable',
        TWITTER_API_KEY: TWITTER_ENABLED ? TWITTER_API_KEY : 'Disable',
        TWITTER_API_SECRET: TWITTER_ENABLED ? TWITTER_API_SECRET : 'Disable',
        TWITTER_ACCESS_TOKEN: TWITTER_ENABLED ? TWITTER_ACCESS_TOKEN : 'Disable',
        TWITTER_ACCESS_SECRET: TWITTER_ENABLED ? TWITTER_ACCESS_SECRET : 'Disable'
    };

    let configError = false;

    for (const [key, value] of Object.entries(config)) {
        if (Array.isArray(value) && !value[0] && !value[1]) {
            console.log(
                'Please make sure you have set either CONTRACT_ADDRESS or CONTRACT_ADDRESSES at (file:./.env)'
            );
            configError = true;
        } else if (!value) {
            console.log(`Please make sure you enter a valid ${key} at (file:./.env)`);
            configError = true;
        }
    }

    if (configError) {
        console.log('https://github.com/kenryu42/ethereum-nft-sales-bot#configuration');
        process.exit(1);
    }
})();

export {
    ABI,
    SUDOSWAP_ABI,
    DOOP_ABI,
    DOOPMARKET_ABI,
    DOOPPROXY_ABI,
    alchemy,
    DEFAULT_NFT_API,
    WEBHOOK_URLS,
    IMAGE_WIDTH,
    TOKEN_TYPE,
    GIF_ENABLED,
    GIF_DURATION,
    TWITTER_ENABLED,
    DISCORD_ENABLED,
    OPENSEA_API_KEY,
    ALCHEMY_API_KEY,
    ETHERSCAN_API_KEY,
    CONTRACT_ADDRESS,
    CONTRACT_ADDRESSES,
    DOOP_ADDRESSES,
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET
};
