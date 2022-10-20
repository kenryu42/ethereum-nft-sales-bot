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

const kodexTweet = async (tx: TransactionData) => {
    if (!client || !rwClient || !tx.tokenType || !tx.tokenData || !tx.tokenData.image) {
        return tx;
    }

    if (
        tx.totalPrice < TWITTER_TWEET_PRICE_THRESHOLD ||
        !WHITELISTED_CURRENCIES.includes(tx.currency.name.toLowerCase())
    ) {
        return tx;
    }

    const field = `
From: ${tx.from}
${tx.market.accountPage}${tx.fromAddr}

To: ${tx.to}
${tx.market.accountPage}${tx.toAddr}
        `;

    const tweetContent = `
${tx.tokenName} sold for ${formatPrice(tx.totalPrice)} ETH ${tx.ethUsdValue} on ${
        tx.market.displayName
    }

${field}

💾 ${tx.market.site}/domain/${tx.tokenName}
			`;

    try {
        await rwClient.v1.tweet(tweetContent);
    } catch (error) {
        console.log(error);
    }

    return tx;
};

export { kodexTweet };
