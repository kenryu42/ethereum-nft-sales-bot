import 'dotenv/config';
import { createRequire } from 'module';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';

// Required settings
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS
    ? process.env.CONTRACT_ADDRESS.toLowerCase()
    : null;
const CONTRACT_ADDRESSES = process.env.CONTRACT_ADDRESSES
    ? process.env.CONTRACT_ADDRESSES.toLowerCase()
    : null;
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

// Image size for the GIF
const GIF_ENABLED = true;
const IMAGE_SIZE = {
    width: 500,
    height: 500
};

// Twitter api settings if enable (optional)
const TWITTER_ENABLED = process.env.TWITTER_ENABLED === '1';
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;

// Discord webhook settings if enable (optional)
const DISCORD_ENABLED = process.env.DISCORD_ENABLED === '1';
const WEBHOOK_1 = process.env.WEBHOOK_URL;
const WEBHOOK_URLS = [WEBHOOK_1].filter((url) => url !== undefined);

// Alchemy provider settings
const require = createRequire(import.meta.url);
const ABI = require('./abi.json');
const NFT_TRADER_ABI = require('./NFTTraderSwap.json');
const options = {
    reconnect: {
        auto: true,
        delay: 5000, // ms
        maxAttempts: 5,
        onTimeout: false
    }
};
const WEB3 = createAlchemyWeb3(`wss://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`, options);

// Error handler for configuration
const checkConfig = (config) => {
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
};

checkConfig({
    CONTRACT: [CONTRACT_ADDRESS, CONTRACT_ADDRESSES],
    OPENSEA_API_KEY: OPENSEA_API_KEY,
    ALCHEMY_API_KEY: ALCHEMY_API_KEY,
    ETHERSCAN_API_KEY: ETHERSCAN_API_KEY,
    WEBHOOK_URL: DISCORD_ENABLED ? WEBHOOK_1 : 'Disable',
    TWITTER_API_KEY: TWITTER_ENABLED ? TWITTER_API_KEY : 'Disable',
    TWITTER_API_SECRET: TWITTER_ENABLED ? TWITTER_API_SECRET : 'Disable',
    TWITTER_ACCESS_TOKEN: TWITTER_ENABLED ? TWITTER_ACCESS_TOKEN : 'Disable',
    TWITTER_ACCESS_SECRET: TWITTER_ENABLED ? TWITTER_ACCESS_SECRET : 'Disable'
});

export {
    ABI,
    WEB3,
    NFT_TRADER_ABI,
    WEBHOOK_URLS,
    IMAGE_SIZE,
    GIF_ENABLED,
    TWITTER_ENABLED,
    DISCORD_ENABLED,
    OPENSEA_API_KEY,
    ALCHEMY_API_KEY,
    ETHERSCAN_API_KEY,
    CONTRACT_ADDRESS,
    CONTRACT_ADDRESSES,
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET
};
