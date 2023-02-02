import { parseDoopTransaction } from './parseDoopTransaction.js';
import { handleEmbedMessage } from '../discord/embed.js';
import { tweet } from '../twitter/tweet.js';
import { DISCORD_ENABLED, TWITTER_ENABLED } from '../config/setup.js';
import type { ContractData } from '../types';

const runDoopApp = async (transactionHash: string, contractAddress: string) => {
    const txData = await parseDoopTransaction(transactionHash, contractAddress);

    if (txData) {
        console.log(
            `${quantity} ${contractName || tokenName} sold on ${
                market.displayName
            } for ${totalPrice} ${currency.name}`
        );
        console.log(`https://etherscan.io/tx/${transactionHash}\n`);
    }

    if (DISCORD_ENABLED && TWITTER_ENABLED && txData) {
        console.log('Sending to Discord...');
        const tweetConfig = await handleEmbedMessage(txData);
        console.log('Tweeting...');
        await tweet(tweetConfig);
    } else if (DISCORD_ENABLED && txData) {
        console.log('Sending to Discord...');
        await handleEmbedMessage(txData);
    } else if (TWITTER_ENABLED && txData) {
        console.log('Tweeting...');
        await tweet(txData);
    }
};

export { runDoopApp };
