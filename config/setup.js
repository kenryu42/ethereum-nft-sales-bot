import 'dotenv/config';
import { createRequire } from 'module';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';

// Required settings
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
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
const TWITTER_ENABLED = false;
const TWITTER_API_KEY = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;

// Discord webhook settings if enable (optional)
const DISCORD_ENABLED = false;
const WEBHOOK_1 = process.env.WEBHOOK_URL;
const WEBHOOK_URLS = [WEBHOOK_1].filter((url) => url !== undefined);

// Alchemy provider settings
const require = createRequire(import.meta.url);
const abi = require('./abi.json');
const options = {
	reconnect: {
		auto: true,
		delay: 5000, // ms
		maxAttempts: 5,
		onTimeout: false
	}
};
const WEB3 = createAlchemyWeb3(
	`wss://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
	options
);
const CONTRACT = new WEB3.eth.Contract(abi, CONTRACT_ADDRESS);

const checkConfig = (config) => {
	let configError = false;

	for (const [key, value] of Object.entries(config)) {
		if (!value) {
			console.log(`Please make sure you enter a valid ${key} at (file:./.env)`);
			configError = true;
		}
	}

	return configError ? process.exit(1) : configError;
};

checkConfig({
	CONTRACT_ADDRESS: CONTRACT_ADDRESS,
	OPENSEA_API_KEY: OPENSEA_API_KEY,
	ALCHEMY_API_KEY: ALCHEMY_API_KEY,
	ETHERSCAN_API_KEY: ETHERSCAN_API_KEY,
	WEBHOOK_URL: DISCORD_ENABLED ? WEBHOOK_1 : 'Disable'
});

export {
	WEB3,
	CONTRACT,
	WEBHOOK_URLS,
	IMAGE_SIZE,
	GIF_ENABLED,
	TWITTER_ENABLED,
	DISCORD_ENABLED,
	OPENSEA_API_KEY,
	ALCHEMY_API_KEY,
	ETHERSCAN_API_KEY,
	CONTRACT_ADDRESS,
	TWITTER_API_KEY,
	TWITTER_API_SECRET,
	TWITTER_ACCESS_TOKEN,
	TWITTER_ACCESS_SECRET
};
