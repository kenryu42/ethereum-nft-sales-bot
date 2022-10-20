import axios from 'axios';
import sharp from 'sharp';
import { EUploadMimeType, TwitterApi } from 'twitter-api-v2';
import {
    DISCORD_ENABLED,
    GIF_ENABLED,
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
import { createGif, createNaImage, resizeImage } from '../utils/image.js';

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
    const imageType = EUploadMimeType.Png;
    let imageBuffer;
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

    if (GIF_ENABLED && tx.quantity > 1 && tx.tokenType === 'ERC721' && !DISCORD_ENABLED) {
        tx.gifImage = await createGif(tx.tokens, tx.contractAddress, tx.tokenType);
    }

    if (!tx.tokenData.image) {
        imageBuffer = await createNaImage(true);
    } else if (tx.tokenData.image.endsWith('.svg')) {
        const buffer = await axios.get(tx.tokenData.image, { responseType: 'arraybuffer' });
        imageBuffer = await sharp(buffer.data).png().toBuffer();
    } else if (tx.tokenData.image.startsWith('data:image/svg+xml;base64,')) {
        const base64Image = tx.tokenData.image.replace('data:image/svg+xml;base64,', '');
        const buffer = Buffer.from(base64Image, 'base64');

        imageBuffer = await sharp(buffer).png().toBuffer();
    } else {
        const buffer = await axios.get(tx.tokenData.image, { responseType: 'arraybuffer' });
        imageBuffer = buffer.data;
    }
    // if image size exceeds 5MB, resize it
    if (imageBuffer.length > 5242880) {
        imageBuffer = await resizeImage(tx.tokenData.image);
    }
    const mediaId = await client.v1.uploadMedia(imageBuffer, {
        mimeType: imageType
    });

    if (isAggregator) {
        tweetContent = `
${tx.quantity > 1 ? `${tx.quantity} ${tx.contractName || tx.tokenName}` : tx.tokenName} \
swept on ${tx.market.displayName} for ${formatPrice(tx.totalPrice)} \
${tx.currency.name} ${tx.ethUsdValue}

🔍 https://etherscan.io/tx/${tx.transactionHash}
			`;
    } else {
        tweetContent = `
${
    tx.quantity > 1 ? `${tx.quantity} ${tx.contractName || tx.tokenName}` : tx.tokenName
} sold for ${formatPrice(tx.totalPrice)} ETH ${tx.ethUsdValue} on ${tx.market.displayName}


🔍 ${tx.market.site}${tx.contractAddress}/${tx.tokens[0]}
			`;
    }

    try {
        await rwClient.v1.tweet(tweetContent, { media_ids: mediaId });
    } catch (error) {
        console.log(error);
    }

    return tx;
};

export { tweet };
