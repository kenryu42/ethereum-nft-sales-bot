import axios from 'axios';
import sharp from 'sharp';
import { TwitterApi, EUploadMimeType } from 'twitter-api-v2';
import { createGif, createSwapGif, createTextImage, resizeImage } from '../utils/image.js';
import { formatPrice } from '../utils/api.js';
import {
    GIF_ENABLED,
    TWITTER_ENABLED,
    DISCORD_ENABLED,
    TWITTER_API_KEY,
    TWITTER_API_SECRET,
    TWITTER_ACCESS_TOKEN,
    TWITTER_ACCESS_SECRET
} from '../config/setup.js';
import type { DoopData, TransactionData } from '../types';

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
    let imageType = EUploadMimeType.Png;
    let imageBuffer;
    let tweetContent;
    const isAggregator =
        tx.recipient === 'gem' || tx.recipient === 'genie' || tx.recipient === 'blurSwap';

    if (!client || !rwClient || !tx.tokenType || !tx.tokenData || !tx.tokenData.image) {
        return;
    }

    if (tx.isNftTrader && tx.swap.maker.address && tx.swap.taker.address && !DISCORD_ENABLED) {
        tx.gifImage = await createSwapGif(tx.swap);
    } else if (GIF_ENABLED && tx.quantity > 1 && tx.tokenType === 'ERC721' && !DISCORD_ENABLED) {
        tx.gifImage = await createGif(tx.tokens, tx.contractAddress, tx.tokenType);
    }

    if (!tx.tokenData.image) {
        imageBuffer = await createTextImage('Content not available yet', true);
    } else if (tx.isNftTrader || (GIF_ENABLED && tx.quantity > 1 && tx.tokenType === 'ERC721')) {
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

    if (isAggregator) {
        tweetContent = `
${tx.quantity > 1 ? `${tx.quantity} ${tx.contractName || tx.tokenName}` : tx.tokenName} \
swept on ${tx.market.displayName} for ${formatPrice(tx.totalPrice)} \
${tx.currency.name} ${tx.ethUsdValue}

Sweeper: ${tx.sweeper}
${tx.market.accountPage}${tx.sweeperAddr}

🔍 https://etherscan.io/tx/${tx.transactionHash}	
			`;
    } else if (tx.isNftTrader && tx.swap.maker.address && tx.swap.taker.address) {
        tweetContent = `
New ${tx.contractName} Swap on NFT Trader

Maker: ${tx.swap.maker.name}
${tx.market.accountPage}${tx.swap.maker.address}
			
Taker: ${tx.swap.taker.name}
${tx.market.accountPage}${tx.swap.taker.address}
			
🔍 https://etherscan.io/tx/${tx.transactionHash}	
            `;
    } else {
        const isX2Y2 = tx.market.name === 'x2y2' ? '/items' : '';
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
} sold for ${formatPrice(tx.totalPrice)} ETH ${tx.ethUsdValue} on ${tx.market.displayName}
			
${field}
			
🔍 ${tx.market.site}${tx.contractAddress}/${tx.tokens[0]}	
			`;
    }

    try {
        await rwClient.v1.tweet(tweetContent, { media_ids: mediaId });
    } catch (error) {
        console.log(error);
    }
};

const tweetDoop = async (tx: DoopData) => {
    let tweetContent;
    const { tokenId, dooplicatorId, totalPrice, addressOnTheOtherSide, buyerAddress } = tx;
    const isMarketplace = tx.recipient === 'dooplicator-marketplace';

    if (!client || !rwClient) {
        return;
    }

    if (isMarketplace) {
        tweetContent = `Doodle #${tokenId} sold it's dooplication rights to ${buyerAddress} \
        for ${totalPrice} ETH and then doop'd with Dooplicator #${dooplicatorId}	
		
        🔍 https://etherscan.io/tx/${tx.transactionHash}
        💻 https://ongaia.com/account/${addressOnTheOtherSide}
        🌈 https://doodles.app/dooplicator/result/${tokenId}`;
    } else {
        tweetContent = `Doodle #${tokenId} was just dooplicated with Dooplicator #${dooplicatorId}	
		
        🔍 https://etherscan.io/tx/${tx.transactionHash}
        💻 https://ongaia.com/account/${addressOnTheOtherSide}
        🌈 https://doodles.app/dooplicator/result/${tokenId}`;
    }

    try {
        await rwClient.v1.tweet(tweetContent);
    } catch (error) {
        console.log(error);
    }
};

export { tweet, tweetDoop };
