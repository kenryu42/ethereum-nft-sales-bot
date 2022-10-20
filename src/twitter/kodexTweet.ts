import axios from 'axios';
import sharp from 'sharp';
import { TwitterApi, EUploadMimeType } from 'twitter-api-v2';
import { createGif, createSwapGif, createNaImage, resizeImage } from '../utils/image.js';
import { formatPrice } from '../utils/api.js';
import {
    GIF_ENABLED,
    TWITTER_ENABLED,
    DISCORD_ENABLED,
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET,
    TWITTER_TWEET_PRICE_THRESHOLD,
    WHITELISTED_CURRENCIES
} from '../config/setup.js';
import type { TransactionData } from '../types';

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

    const field =
        tx.tokenType === 'ERC721' && tx.quantity > 1
            ? `
Sweeper: ${tx.to}
${tx.market.accountPage}${tx.toAddr}
        `
            : `
From: ${tx.from}
${tx.market.accountPage}${tx.fromAddr}

To: ${tx.to}
${tx.market.accountPage}${tx.toAddr}
        `;

    const tweetContent = `
${
    tx.quantity > 1 ? `${tx.quantity} ${tx.contractName || tx.tokenName}` : tx.tokenName
} sold for ${formatPrice(tx.totalPrice)} ETH ${tx.ethUsdValue} on ${tx.market.displayName}

${field}

🔍 ${tx.market.site}${tx.contractAddress}/${tx.tokens[0]}
			`;

    try {
        await rwClient.v1.tweet(tweetContent);
    } catch (error) {
        console.log(error);
    }

    return tx;
};

export { kodexTweet };
