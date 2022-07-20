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
            console.log(
                '--------------------------------------------------------------------------------'
            );
            console.log(`${tokenData.collectionName} Swap on NFTTrader.io #${swap.id}`);
            console.log(`Maker: ${swap[addressMaker].name}`);
            console.log(`Spent Assets: ${JSON.stringify(swap[addressMaker].spentAssets, 0, 2)}`);
            console.log(`Spent Value: ${swap[addressMaker].spentAmount} ETH`);
            console.log(
                `Received Assets: ${JSON.stringify(swap[addressMaker].receivedAssets, 0, 2)}`
            );
            console.log(`Received Value: ${swap[addressMaker].receivedAmount} ETH`);
            console.log('🔄');
            console.log(`Taker: ${swap[addressTaker].name}`);
            console.log(`Spent Assets: ${JSON.stringify(swap[addressTaker].spentAssets, 0, 2)}`);
            console.log(`Spent Value: ${swap[addressTaker].spentAmount} ETH`);
            console.log(
                `Received Assets: ${JSON.stringify(swap[addressTaker].receivedAssets, 0, 2)}`
            );
            console.log(`Received Value: ${swap[addressTaker].receivedAmount} ETH`);
            console.log(`\nhttps://etherscan.io/tx/${transactionHash}`);
            console.log(
                '--------------------------------------------------------------------------------'
            );
        } else {
            console.log(
                `${quantity} ${tokenData.collectionName} sold on ${market.name} for ${totalPrice} ${currency.name}`
            );
            console.log(`https://etherscan.io/tx/${transactionHash}\n`);
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
