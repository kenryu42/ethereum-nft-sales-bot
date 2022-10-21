import { TwitterApi } from 'twitter-api-v2';
import {
    TWITTER_ACCESS_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_ENABLED,
    TWITTER_TWEET_PRICE_THRESHOLD,
    WHITELISTED_CURRENCIES
} from '../config/setup.js';
import type { TransactionData } from '../types';
import { formatPrice } from '../utils/api.js';

const client = TWITTER_ENABLED
    ? new TwitterApi({
          appKey: TWITTER_API_KEY,
          appSecret: TWITTER_API_SECRET,
          accessToken: TWITTER_ACCESS_TOKEN,
          accessSecret: TWITTER_ACCESS_SECRET
      })
    : null;

const rwClient = TWITTER_ENABLED && client ? client.readWrite : null;

const tweet = async (tx: TransactionData) => {
    let tweetContent;
    const isAggregator = tx.recipient === 'gem' || tx.recipient === 'genie';

    if (!client || !rwClient || !tx.tokenType || !tx.tokenData || !tx.tokenData.image) {
        return tx;
    }

    if (
        tx.totalPrice < TWITTER_TWEET_PRICE_THRESHOLD ||
        !WHITELISTED_CURRENCIES.includes(tx.currency.name.toLowerCase())
    ) {
        return tx;
    }

    if (isAggregator) {
        tweetContent = `
${tx.quantity > 1 ? `${tx.quantity} ${tx.contractName || tx.tokenName}` : tx.tokenName} \
swept on ${tx.market.displayName} for ${formatPrice(tx.totalPrice)} \
${tx.currency.name} ${tx.ethUsdValue} #domains $ENS

https://etherscan.io/tx/${tx.transactionHash}
			`;
    } else {
        tweetContent = `
${
    tx.quantity > 1 ? `${tx.quantity} ${tx.contractName || tx.tokenName}` : tx.tokenName
} bought for ${formatPrice(tx.totalPrice)} ETH on ${tx.market.displayName} #domains $ENS

${tx.market.site}${tx.contractAddress}/${tx.tokenId}
			`;
    }

    try {
        await rwClient.v1.tweet(tweetContent);
    } catch (error) {
        console.log(error);
    }

    return tx;
};

export { tweet };
