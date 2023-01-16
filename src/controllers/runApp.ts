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
        const {
            tokenName,
            contractName,
            recipient,
            swap,
            addressMaker,
            addressTaker,
            market,
            totalPrice,
            currency,
            quantity
        } = txData;

        if (recipient === 'nft-trader' && addressMaker && addressTaker) {
            console.log(
                '--------------------------------------------------------------------------------'
            );
            console.log(`${contractName} Swap on NFTTrader.io #${swap.id}`);
            console.log(`Maker: ${swap[addressMaker].name}`);
            console.log(`Spent Assets: ${JSON.stringify(swap[addressMaker].spentAssets)}`);
            console.log(`Spent Value: ${swap[addressMaker].spentAmount} ETH`);
            console.log(`Received Assets: ${JSON.stringify(swap[addressMaker].receivedAssets)}`);
            console.log(`Received Value: ${swap[addressMaker].receivedAmount} ETH`);
            console.log('🔄');
            console.log(`Taker: ${swap[addressTaker].name}`);
            console.log(`Spent Assets: ${JSON.stringify(swap[addressTaker].spentAssets)}`);
            console.log(`Spent Value: ${swap[addressTaker].spentAmount} ETH`);
            console.log(`Received Assets: ${JSON.stringify(swap[addressTaker].receivedAssets)}`);
            console.log(`Received Value: ${swap[addressTaker].receivedAmount} ETH`);
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
        const tweetConfig = await handleEmbedMessage(txData);
        await tweet(tweetConfig);
    } else if (DISCORD_ENABLED && txData) {
        await handleEmbedMessage(txData);
    } else if (TWITTER_ENABLED && txData) {
        await tweet(txData);
    }
};

export { runApp };
