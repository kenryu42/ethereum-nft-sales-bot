import 'dotenv/config'; // You will need to run `npm install dotenv` to use this in your project
import { Auth, ENFT } from '../../dist/index.js'; // Change the path to 'enft' if you are using the package

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

// Etherscan api key is optional for eth to usd conversion
const etherscanApiKey = process.env.ETHERSCAN_API_KEY;

// Required
const contractAddress = process.env.CONTRACT_ADDRESS;

enft.onItemSold(
    {
        contractAddress: contractAddress, // Required
        etherscanApiKey: etherscanApiKey, // Optional
        discordWebhook: discordWebhook, // Optional
        twitterConfig: twitterConfig // Optional
    },
    (txData) => {
        if (txData.swap) {
            console.log(
                '--------------------------------------------------------------------------------'
            );
            console.log(`${txData.contractData.name} Swap on NFTTrader.io`);
            console.log(`Maker: ${txData.swap.maker.name}`);
            console.log(
                `Spent Assets: ${JSON.stringify(
                    txData.swap.maker.spentAssets,
                    null,
                    2
                )}`
            );
            console.log(`Spent Value: ${txData.swap.maker.spentAmount} ETH`);
            console.log('🔄');
            console.log(`Taker: ${txData.swap.taker.name}`);
            console.log(
                `Spent Assets: ${JSON.stringify(
                    txData.swap.taker.spentAssets,
                    null,
                    2
                )}`
            );
            console.log(`Spent Value: ${txData.swap.taker.spentAmount} ETH`);
            console.log(`\nhttps://etherscan.io/tx/${txData.transactionHash}`);
            console.log(
                '--------------------------------------------------------------------------------'
            );
        } else {
            console.log(
                `${txData.totalAmount} ${txData.contractData.name} sold on ${txData.interactedMarket.displayName} for ${txData.totalPrice} ${txData.currency.name}`
            );
            console.log(`https://etherscan.io/tx/${txData.transactionHash}\n`);
        }
    }
);
