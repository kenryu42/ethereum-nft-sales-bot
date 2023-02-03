import { parseDoopTransaction } from './parseDoopTransaction.js';
import { handleDoopEmbedMessage } from '../discord/embed.js';
import { tweetDoop } from '../twitter/tweet.js';
import { DISCORD_ENABLED, TWITTER_ENABLED } from '../config/setup.js';

const runDoopApp = async (transactionHash: string, contractAddress: string) => {
    const txData = await parseDoopTransaction(transactionHash, contractAddress);

    if (txData) {
        const { tokenId, dooplicatorId, totalPrice, addressOnTheOtherSide, buyerAddress } = txData;
        if (buyerAddress) {
            console.log(
                `Doodle #${tokenId} sold it's dooplication rights to ${buyerAddress} for ${totalPrice} ETH`
            );
        } else {
            console.log(
                `Doodle #${tokenId} was just dooplicated with Dooplicator #${dooplicatorId}`
            );
        }

        console.log(`https://doodles.app/dooplicator/result/${tokenId}\n`);
        console.log(`https://ongaia.com/account/${addressOnTheOtherSide}\n`);
        console.log(`https://etherscan.io/tx/${transactionHash}\n`);
    }

    if (DISCORD_ENABLED && TWITTER_ENABLED && txData) {
        console.log('Sending to Discord...');
        const tweetConfig = await handleDoopEmbedMessage(txData);
        console.log('Tweeting...');
        await tweetDoop(tweetConfig);
    } else if (DISCORD_ENABLED && txData) {
        console.log('Sending to Discord...');
        await handleDoopEmbedMessage(txData);
    } else if (TWITTER_ENABLED && txData) {
        console.log('Tweeting...');
        await tweetDoop(txData);
    }
};

export { runDoopApp };
