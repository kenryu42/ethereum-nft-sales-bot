import 'dotenv/config'; // You will need to run `npm install dotenv` to use this
import { Auth, ENFT } from '../../dist/index.js'; // Change the path to 'enft' if you are using the package

// Set up contract address and txHash from command line
const contract = process.argv[2];
const txHash = process.argv[3];

if (!txHash || !contract) {
    console.log('No contract or txHash provided');
    console.log(
        'Usage: node example/ts/debugTransaction.ts <contract> <txHash>'
    );
    process.exit(1);
}

// Set up the Auth with the provider api keys (at least one is required)
const auth = new Auth({
    alchemy: {
        apiKey: process.env.ALCHEMY_API_KEY
    },
    infura: {
        apiKey: process.env.INFURA_API_KEY,
        apiKeySecret: process.env.INFURA_API_KEY_SECRET
    }
});

// Create the ENFT object with the Auth
const enft = new ENFT(auth);

// Discord webhook is optional
const discordWebhook = process.env.DISCORD_WEBHOOK;

// Twitter config is optional
const twitterConfig = {
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
    accessToken: process.env.TWITTER_API_ACCESS_TOKEN,
    accessSecret: process.env.TWITTER_API_ACCESS_SECRET
};

// Etherscan api key is optional for enabling eth to usd conversion
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

enft.debugTransaction(
    {
        transactionHash: txHash, // transaction hash is required when using debugTransaction
        contractAddress: contract, // Required
        discordWebhook: discordWebhook, // Optional
        twitterConfig: twitterConfig, // Optional
        etherscanApiKey: etherscanApiKey // Optional
    },
    (txData) => {
        console.log(txData);
    }
);
