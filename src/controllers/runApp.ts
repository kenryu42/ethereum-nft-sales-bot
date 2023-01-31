import { parseTransaction } from './parseTransaction.js';
import { handleEmbedMessage } from '../discord/embed.js';
import { tweet } from '../twitter/tweet.js';
import { DISCORD_ENABLED, TWITTER_ENABLED } from '../config/setup.js';
import type { ContractData } from '../types';

const runApp = async (
    transactionHash: string,
    contractAddress: string,
    contractData: ContractData
) => {
    const txData = await parseTransaction(transactionHash, contractAddress, contractData);

    if (txData) {
        const { tokenName, contractName, swap, market, totalPrice, currency, quantity } = txData;

        if (txData.isNftTrader && txData.swap.taker.address && txData.swap.maker.address) {
            console.log(
                '--------------------------------------------------------------------------------'
            );
            console.log(`${contractName} Swap on NFTTrader.io`);
            console.log(`Maker: ${swap.maker.name}`);
            console.log(`Spent Assets: ${JSON.stringify(swap.maker.spentAssets, null, 2)}`);
            console.log(`Spent Value: ${swap.maker.spentAmount} ETH`);
            console.log('🔄');
            console.log(`Taker: ${swap.taker.name}`);
            console.log(`Spent Assets: ${JSON.stringify(swap.taker.spentAssets, null, 2)}`);
            console.log(`Spent Value: ${swap.taker.spentAmount} ETH`);
            console.log(`\nhttps://etherscan.io/tx/${transactionHash}`);
            console.log(
                '--------------------------------------------------------------------------------'
            );
        } else {
            console.log(
                `${quantity} ${contractName || tokenName} sold on ${
                    market.displayName
                } for ${totalPrice} ${currency.name}`
            );
            console.log(`https://etherscan.io/tx/${transactionHash}\n`);
        }
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

export { runApp };
