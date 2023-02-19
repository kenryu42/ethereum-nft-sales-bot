import retry from 'async-retry';
import {
    TwitterApi,
    EUploadMimeType,
    TwitterApiReadWrite
} from 'twitter-api-v2';
import { Logger, log } from '../Logger/index.js';
import { formatPrice } from '../utils/helper.js';
import { createGif, createSwapGif, parseImage } from '../utils/image.js';

import type { TransactionData } from '../types/models/transaction.model.js';
import type { Config, Options } from '../types/interfaces/enft.interface.js';

/**
 *
 * A method that handles the tweeting of transactions.
 *
 * @async
 * @function
 */
const handleTweet = async (
    tx: TransactionData,
    config: Config,
    options: Options
): Promise<void> => {
    if (!options.twitterConfig) {
        throw log.throwError(
            'No Twitter config',
            Logger.code.MISSING_ARGUMENT,
            {
                location: Logger.location.TWITTER_TWEET
            }
        );
    }
    const client = new TwitterApi(options.twitterConfig);

    if (tx.swap) {
        await sendSwapTweet(tx, config, client);
    } else if (tx.totalAmount > 1) {
        await sendSweepTweet(tx, client);
    } else {
        await sendSaleTweet(tx, client);
    }
};

/**
 *
 * A private method that tweets a swap transaction.
 *
 * @async
 * @function
 */
const sendSwapTweet = async (
    tx: TransactionData,
    config: Config,
    client: TwitterApi
): Promise<void> => {
    if (!tx.swap) {
        throw log.throwError('No swap data', Logger.code.MISSING_ARGUMENT, {
            location: Logger.location.TWITTER_SEND_SWAP_TWEET
        });
    }

    const titleName = tx.contractData.name || tx.contractData.symbol;

    const content = `
New ${titleName ? `${titleName} Swap!` : 'Swap on NftTrader!'}

Maker: ${tx.swap?.maker.name}
${tx.interactedMarket.accountPage}${tx.swap?.maker.address}

Taker: ${tx.swap?.taker.name}
${tx.interactedMarket.accountPage}${tx.swap?.maker.address}

🔍 https://etherscan.io/tx/${tx.transactionHash}
        `;

    const gifImage = tx.gifImage ?? (await createSwapGif(tx.swap, config));
    const mediaId = await client.v1.uploadMedia(gifImage as Buffer, {
        mimeType: EUploadMimeType.Gif
    });

    await sendTweet(content, mediaId, client.readWrite);
};

/**
 *
 * A private method that tweets a sweep transaction.
 *
 * @async
 * @function
 */
const sendSweepTweet = async (
    tx: TransactionData,
    client: TwitterApi
): Promise<void> => {
    const titleName = tx.contractData.name || tx.contractData.symbol;

    const content = `
${tx.totalAmount} ${titleName} sold for ${formatPrice(tx.totalPrice)} ${
        tx.currency.name
    } ${tx.usdPrice ? `($${tx.usdPrice})` : ''} on ${
        tx.interactedMarket.displayName
    }

${tx.isBlurBid ? 'Seller' : 'Sweeper'}: ${tx.toAddrName}
${tx.interactedMarket.accountPage}${tx.toAddr}

🔍 https://etherscan.io/tx/${tx.transactionHash}
        `;

    const gifImage = tx.gifImage ?? (await createGif(tx.tokens));
    const mediaId = await client.v1.uploadMedia(gifImage as Buffer, {
        mimeType: EUploadMimeType.Gif
    });

    await sendTweet(content, mediaId, client.readWrite);
};

/**
 *
 * A private method that tweets a sale transaction.
 *
 * @async
 * @function
 */
const sendSaleTweet = async (
    tx: TransactionData,
    client: TwitterApi
): Promise<void> => {
    const tokenId = Object.keys(tx.tokens)[0];
    const token = tx.tokens[tokenId];
    const isX2Y2 = tx.interactedMarket.name === 'x2y2' ? '/items' : '';

    const content = `
${token.name || `${tx.contractData.symbol} #${tokenId}`} sold for ${formatPrice(
        tx.totalPrice
    )} ${tx.currency.name} ${tx.usdPrice ? `($${tx.usdPrice})` : ''} on ${
        tx.interactedMarket.displayName
    }

From: ${tx.fromAddrName}
${tx.interactedMarket.accountPage}${tx.fromAddr}${isX2Y2}

To: ${tx.toAddrName}
${tx.interactedMarket.accountPage}${tx.toAddr}${isX2Y2}

🔍 https://etherscan.io/tx/${tx.transactionHash}
        `;

    const sharpImage = await parseImage(token.image);
    const imageBuffer = await sharpImage.png().resize(512).toBuffer();
    const mediaId = await client.v1.uploadMedia(imageBuffer, {
        mimeType: EUploadMimeType.Png
    });

    await sendTweet(content, mediaId, client.readWrite);
};

/**
 *
 * A private method that sends a tweet.
 *
 * @async
 * @function
 * @param {string} content - The content of the tweet.
 * @param {string} mediaId - The media id of the tweet.
 */
const sendTweet = async (
    content: string,
    mediaId: string,
    rwclient: TwitterApiReadWrite
): Promise<void> => {
    await retry(async () => {
        await rwclient.v1.tweet(content, {
            media_ids: mediaId
        });
    });
};

export { handleTweet };
