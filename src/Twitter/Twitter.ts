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

interface TweetConfig {
    tx: TransactionData;
    config: Config;
    options: Options;
}

/**
 * @description A class that handles the tweeting of transactions.
 */
export class Twitter {
    private readonly config: Config;
    private readonly options: Options;
    private readonly client: TwitterApi;
    private readonly rwclient: TwitterApiReadWrite;
    private readonly tx: TransactionData;

    constructor(config: TweetConfig) {
        this.tx = config.tx;
        this.config = config.config;
        this.options = config.options;

        if (!this.options.twitterConfig) {
            throw log.throwMissingArgumentError('twitterConfig', {
                location: Logger.location.TWITTER_CONSTRUCTOR
            });
        }
        this.client = new TwitterApi(this.options.twitterConfig);
        this.rwclient = this.client.readWrite;
    }

    /**
     *
     * A method that handles the tweeting of transactions.
     *
     * @async
     * @function
     */
    tweet = async (): Promise<void> => {
        if (this.tx.swap) {
            await this.sendSwapTweet();
        } else if (this.tx.totalAmount > 1) {
            await this.sendSweepTweet();
        } else {
            await this.sendSaleTweet();
        }
    };

    /**
     *
     * A private method that tweets a swap transaction.
     *
     * @private
     * @async
     * @function
     */
    private sendSwapTweet = async (): Promise<void> => {
        if (!this.tx.swap) {
            throw log.throwError('No swap data', Logger.code.MISSING_ARGUMENT, {
                location: Logger.location.TWITTER_SEND_SWAP_TWEET
            });
        }

        const titleName =
            this.tx.contractData.name || this.tx.contractData.symbol;

        const content = `
New ${titleName ? `${titleName} Swap!` : 'Swap on NftTrader!'}

Maker: ${this.tx.swap?.maker.name}
${this.tx.interactedMarket.accountPage}${this.tx.swap?.maker.address}

Taker: ${this.tx.swap?.taker.name}
${this.tx.interactedMarket.accountPage}${this.tx.swap?.maker.address}

🔍 https://etherscan.io/tx/${this.tx.transactionHash}
        `;

        const gifImage =
            this.tx.gifImage ??
            (await createSwapGif(this.tx.swap, this.config));
        const mediaId = await this.client.v1.uploadMedia(gifImage as Buffer, {
            mimeType: EUploadMimeType.Gif
        });

        await this.sendTweet(content, mediaId);
    };

    /**
     *
     * A private method that tweets a sweep transaction.
     *
     * @private
     * @async
     * @function
     */
    private sendSweepTweet = async (): Promise<void> => {
        const titleName =
            this.tx.contractData.name || this.tx.contractData.symbol;

        const content = `
${this.tx.totalAmount} ${titleName} sold for ${formatPrice(
            this.tx.totalPrice
        )} ${this.tx.currency.name} ${
            this.tx.usdPrice ? `($${this.tx.usdPrice})` : ''
        } on ${this.tx.interactedMarket.displayName}

${this.tx.isBlurBid ? 'Seller' : 'Sweeper'}: ${this.tx.toAddrName}
${this.tx.interactedMarket.accountPage}${this.tx.toAddr}

🔍 https://etherscan.io/tx/${this.tx.transactionHash}
        `;

        const gifImage = this.tx.gifImage ?? (await createGif(this.tx.tokens));
        const mediaId = await this.client.v1.uploadMedia(gifImage as Buffer, {
            mimeType: EUploadMimeType.Gif
        });

        await this.sendTweet(content, mediaId);
    };

    /**
     *
     * A private method that tweets a sale transaction.
     *
     * @private
     * @async
     * @function
     */
    private sendSaleTweet = async (): Promise<void> => {
        const tokenId = Object.keys(this.tx.tokens)[0];
        const token = this.tx.tokens[tokenId];
        const isX2Y2 = this.tx.interactedMarket.name === 'x2y2' ? '/items' : '';

        const content = `
${
    token.name || `${this.tx.contractData.symbol} #${tokenId}`
} sold for ${formatPrice(this.tx.totalPrice)} ${this.tx.currency.name} ${
            this.tx.usdPrice ? `($${this.tx.usdPrice})` : ''
        } on ${this.tx.interactedMarket.displayName}

From: ${this.tx.fromAddrName}
${this.tx.interactedMarket.accountPage}${this.tx.fromAddr}${isX2Y2}

To: ${this.tx.toAddrName}
${this.tx.interactedMarket.accountPage}${this.tx.toAddr}${isX2Y2}

🔍 https://etherscan.io/tx/${this.tx.transactionHash}
        `;

        const sharpImage = await parseImage(token.image);
        const imageBuffer = await sharpImage.png().resize(512).toBuffer();
        const mediaId = await this.client.v1.uploadMedia(imageBuffer, {
            mimeType: EUploadMimeType.Png
        });

        await this.sendTweet(content, mediaId);
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
    private sendTweet = async (
        content: string,
        mediaId: string
    ): Promise<void> => {
        await retry(async () => {
            await this.rwclient.v1.tweet(content, {
                media_ids: mediaId
            });
        });
    };
}
