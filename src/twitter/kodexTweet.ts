import axios from 'axios';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
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
import { formatPrice, getKodexLastSale } from '../utils/api.js';
import { resizeImage } from '../utils/image.js';

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
    const imageType = EUploadMimeType.Png;
    let imageBuffer;

    if (!client || !rwClient || !tx.tokenType || !tx.tokenData || !tx.tokenData.image) {
        return tx;
    }

    if (
        tx.totalPrice < TWITTER_TWEET_PRICE_THRESHOLD ||
        !WHITELISTED_CURRENCIES.includes(tx.currency.name.toLowerCase())
    ) {
        return tx;
    }

    const previouslySoldFor = await getKodexLastSale(tx.tokenName || '');

    const buffer = await axios.get(
        `https://domains.kodex.io/api/og/eventSale?likes=0&soldFor=${formatPrice(
            tx.totalPrice
        )}&domainLabel=${tx.tokenName}${
            previouslySoldFor ? `&previouslySoldFor=${previouslySoldFor}` : ''
        }`,
        { responseType: 'arraybuffer' }
    );
    imageBuffer = buffer.data;

    // if image size exceeds 5MB, resize it
    if (imageBuffer.length > 5242880) {
        imageBuffer = await resizeImage(tx.tokenData.image);
    }
    const mediaId = await client.v1.uploadMedia(imageBuffer, {
        mimeType: imageType
    });

    const field = `
From: ${tx.from}
${tx.market.accountPage}${tx.fromAddr}

To: ${tx.to}
${tx.market.accountPage}${tx.toAddr}
        `;

    const tweetContent = `
${tx.tokenName} sold for ${formatPrice(tx.totalPrice)} ETH ${tx.ethUsdValue} on ${
        tx.market.displayName
    } #domains $ENS

${field}

🔮 ${tx.market.site}domain/${tx.tokenName}
			`;

    try {
        await rwClient.v1.tweet(tweetContent, { media_ids: mediaId });
    } catch (error) {
        console.log(error);
    }

    return tx;
};

export { kodexTweet };
