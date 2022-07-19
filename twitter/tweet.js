import { TwitterApi, EUploadMimeType } from 'twitter-api-v2';
import axios from 'axios';
import { createGif, createSwapGif, createNaImage, resizeImage } from '../utils/image.js';
import { formatPrice } from '../utils/api.js';
import {
    GIF_ENABLED,
    TWITTER_ENABLED,
    DISCORD_ENABLED,
    CONTRACT_ADDRESS,
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET
} from '../config/setup.js';

const client = TWITTER_ENABLED
    ? new TwitterApi({
          appKey: TWITTER_API_KEY,
          appSecret: TWITTER_API_SECRET,
          accessToken: TWITTER_ACCESS_TOKEN,
          accessSecret: TWITTER_ACCESS_SECRET
      })
    : null;

const rwClient = TWITTER_ENABLED ? client.readWrite : null;

const tweet = async (tx) => {
    let mediaId;
    let tweetContent;

    if (tx.isSwap && !DISCORD_ENABLED) {
        tx.gifImage = await createSwapGif(tx.swap, tx.addressMaker, tx.addressTaker);
    } else if (tx.isSweep && !DISCORD_ENABLED) {
        tx.gifImage = await createGif(tx.tokens);
    }

    if (!tx.tokenData.image) {
        const naImage = await createNaImage(true);
        mediaId = await client.v1.uploadMedia(naImage, {
            mimeType: EUploadMimeType.Png
        });
    } else if (tx.isSwap || (GIF_ENABLED && tx.quantity > 1 && tx.tokenType === 'ERC721')) {
        mediaId = await client.v1.uploadMedia(tx.gifImage, {
            mimeType: EUploadMimeType.Gif
        });
    } else {
        const response = await axios.get(tx.tokenData.image, {
            responseType: 'arraybuffer'
        });
        let buffer = Buffer.from(response.data, 'utf-8');

        // if image size exceeds 5MB, resize it
        if (buffer.length > 5242880) {
            buffer = await resizeImage(tx.tokenData.image);
        }
        mediaId = await client.v1.uploadMedia(buffer, {
            mimeType: EUploadMimeType.Png
        });
    }

    if (tx.isSweep) {
        tweetContent = `
${tx.quantity > 1 ? `${tx.quantity} ${tx.tokenData.collectionName}` : tx.tokenData.name} \
swept on ${tx.market.name} for ${formatPrice(tx.totalPrice)} \
${tx.currency.name} ${tx.ethUsdValue}

【 Sweeper: ${tx.sweeper} 】
${tx.market.accountPage}${tx.sweeperAddr}

【 Transaction 】
https://etherscan.io/tx/${tx.transactionHash}	
			`;
    } else if (tx.isSwap) {
        tweetContent = `
${tx.tokenData.collectionName} Swap on NFTTrader.io

【 Address 1: ${tx.swap[tx.addressMaker].name} 】
${tx.market.accountPage}${tx.addressMaker}
			
【 Address 2: ${tx.swap[tx.addressTaker].name} 】
${tx.market.accountPage}${tx.addressTaker}
			
【 Link 】
${tx.market.site}${tx.transactionHash}
            `;
    } else {
        const isX2Y2 = tx.market.name === 'X2Y2 ⭕️' ? '/items' : '';
        tweetContent = `
${tx.tokenData.name} sold for ${formatPrice(tx.totalPrice)} ETH ${tx.ethUsdValue}

【 Marketplace 】
${tx.market.name}
			
【 From: ${tx.from} 】
${tx.market.accountPage}${tx.fromAddr}${isX2Y2}
			
【 To: ${tx.to} 】
${tx.market.accountPage}${tx.toAddr}${isX2Y2}
			
【 Link 】
${tx.market.site}${CONTRACT_ADDRESS}/${tx.tokens[0]}	
			`;
    }

    try {
        await rwClient.v1.tweet(tweetContent, { media_ids: mediaId });
    } catch (error) {
        console.log(error);
    }
};

export { tweet };
