import { parseTransaction } from './parseTransaction.js';
import { sendEmbedMessage } from '../discord/index.js';
import { tweet } from '../twitter/tweet.js';
import { DISCORD_ENABLED, TWITTER_ENABLED } from '../config/setup.js';

const runApp = async (provider, transactionHash, contractAddress, tokenType) => {
    const txConfig = await parseTransaction(provider, transactionHash, contractAddress, tokenType);

    if (txConfig) {
        const {
            tokenData,
            isSwap,
            swap,
            addressMaker,
            addressTaker,
            market,
            totalPrice,
            currency,
            quantity
        } = txConfig;

        if (isSwap) {
            console.log(`${tokenData.collectionName} swap on NFT Trader`);
            console.log(`1. ${swap[addressMaker].name}`);
            console.log(`Received Assets: ${JSON.stringify(swap[addressMaker].receivedAssets)}`);
            console.log(`Received Eth: ${swap[addressMaker].receivedValue}`);
            console.log(`2. ${swap[addressTaker].name}`);
            console.log(`Received Assets: ${JSON.stringify(swap[addressTaker].receivedAssets)}`);
            console.log(`Received Eth: ${swap[addressTaker].receivedValue}`);
        } else {
            console.log(
                `${quantity} ${tokenData.collectionName} sold on ${market.name} for ${totalPrice} ${currency.name}\n`
            );
        }
    }

    if (DISCORD_ENABLED && TWITTER_ENABLED && txConfig) {
        const tweetConfig = await sendEmbedMessage(txConfig);
        await tweet(tweetConfig);
    } else if (DISCORD_ENABLED && txConfig) {
        await sendEmbedMessage(txConfig);
    } else if (TWITTER_ENABLED && txConfig) {
        await tweet(txConfig);
    }
};

export { runApp };
