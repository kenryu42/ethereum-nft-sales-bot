import axios from 'axios';
import sharp from 'sharp';
import { TwitterApi, EUploadMimeType } from 'twitter-api-v2';
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
    let imageType = EUploadMimeType.Png;
    let imageBuffer;
    let tweetContent;

    if (tx.isSwap && !DISCORD_ENABLED) {
        tx.gifImage = await createSwapGif(tx.swap, tx.addressMaker, tx.addressTaker);
    } else if (tx.isSweep && !DISCORD_ENABLED) {
        tx.gifImage = await createGif(tx.tokens, CONTRACT_ADDRESS, tx.tokenType);
    }

    if (!tx.tokenData.image) {
        imageBuffer = await createNaImage(true);
    } else if (tx.isSwap || (GIF_ENABLED && tx.quantity > 1 && tx.tokenType === 'ERC721')) {
        imageBuffer = tx.gifImage;
        imageType = EUploadMimeType.Gif;
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

    if (tx.isSweep) {
        tweetContent = `
${tx.quantity > 1 ? `${tx.quantity} ${tx.contractName || tx.tokenName}` : tx.tokenName} \
swept on ${tx.market.name} for ${formatPrice(tx.totalPrice)} \
${tx.currency.name} ${tx.ethUsdValue}

Sweeper: ${tx.sweeper}
${tx.market.accountPage}${tx.sweeperAddr}

🔍 https://etherscan.io/tx/${tx.transactionHash}	
			`;
    } else if (tx.isSwap) {
        tweetContent = `
New ${tx.contractName} Swap on NFT Trader

Maker: ${tx.swap[tx.addressMaker].name}
${tx.market.accountPage}${tx.addressMaker}
			
Taker: ${tx.swap[tx.addressTaker].name}
${tx.market.accountPage}${tx.addressTaker}
			
🔍 ${tx.market.site}${tx.transactionHash}
            `;
    } else {
        const isX2Y2 = tx.market.name === 'X2Y2 ⭕️' ? '/items' : '';
        const field =
            tx.tokenType === 'ERC721' && tx.quantity > 1
                ? `
Sweeper: ${tx.to}
${tx.market.accountPage}${tx.toAddr}${isX2Y2}
        `
                : `
From: ${tx.from}
${tx.market.accountPage}${tx.fromAddr}${isX2Y2}
                    
To: ${tx.to}
${tx.market.accountPage}${tx.toAddr}${isX2Y2}
        `;

        tweetContent = `
${
    tx.quantity > 1 ? `${tx.quantity} ${tx.contractName || tx.tokenName}` : tx.tokenName
} sold for ${formatPrice(tx.totalPrice)} ETH ${tx.ethUsdValue} on ${tx.market.name}
			
${field}
			
🔍 ${tx.market.site}${CONTRACT_ADDRESS}/${tx.tokens[0]}	
			`;
    }

    try {
        await rwClient.v1.tweet(tweetContent, { media_ids: mediaId });
    } catch (error) {
        console.log(error);
    }
};

export { tweet };
