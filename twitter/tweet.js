import { TwitterApi, EUploadMimeType } from 'twitter-api-v2';
import axios from 'axios';
import { createGif, createNaImage, resizeImage } from '../utils/image.js';
import { formatPrice, getReadableName } from '../utils/api.js';
import {
	DISCORD_ENABLED,
	CONTRACT_ADDRESS,
	TWITTER_API_KEY,
	TWITTER_API_SECRET,
	TWITTER_ACCESS_TOKEN,
	TWITTER_ACCESS_SECRET,
	GIF_ENABLED
} from '../config/setup.js';

const client = new TwitterApi({
	appKey: TWITTER_API_KEY,
	appSecret: TWITTER_API_SECRET,
	accessToken: TWITTER_ACCESS_TOKEN,
	accessSecret: TWITTER_ACCESS_SECRET
});

const rwClient = client.readWrite;

const tweet = async (tweetConfig) => {
	const {
		isSweep,
		quantity,
		tokens,
		tokenType,
		tokenData,
		market,
		usdPrice,
		totalPrice,
		currency,
		sweeperAddr,
		fromAddr,
		toAddr,
		transactionHash
	} = tweetConfig;
	let { sweeper, gifImage, from, to, ethUsdValue } = tweetConfig;
	let mediaId;

	if (!DISCORD_ENABLED) {
		ethUsdValue =
			currency.name === 'ETH' || currency.name === 'WETH'
				? `($ ${usdPrice})`
				: '';
	}
	if (!DISCORD_ENABLED && isSweep) {
		sweeper = await getReadableName(sweeperAddr);
		gifImage = await createGif(tokens);
	} else if (!DISCORD_ENABLED) {
		from = await getReadableName(fromAddr);
		to = await getReadableName(toAddr);
	}

	if (!tokenData.image) {
		const naImage = await createNaImage(true);
		mediaId = await client.v1.uploadMedia(naImage, {
			mimeType: EUploadMimeType.Png
		});
	} else if (GIF_ENABLED && quantity > 1 && tokenType === 'ERC721') {
		mediaId = await client.v1.uploadMedia(gifImage, {
			mimeType: EUploadMimeType.Gif
		});
	} else {
		const response = await axios.get(tokenData.image, {
			responseType: 'arraybuffer'
		});
		let buffer = Buffer.from(response.data, 'utf-8');

		// if image size exceeds 5MB, resize it
		if (buffer.length > 5242880) {
			buffer = await resizeImage(tokenData.image);
		}
		mediaId = await client.v1.uploadMedia(buffer, {
			mimeType: EUploadMimeType.Png
		});
	}

	if (isSweep) {
		try {
			const tweetContent = `
			${quantity > 1 ? `${quantity} ${tokenData.collectionName}` : tokenData.name} \
			swept on ${market.name} for ${formatPrice(totalPrice)} \
			${currency.name} ${ethUsdValue}

			【 Sweeper: ${sweeper} 】
			${market.account_site}${sweeperAddr}

			【 Transaction 】
			https://etherscan.io/tx/${transactionHash}	
			`;
			await rwClient.v1.tweet(tweetContent, { media_ids: mediaId });
		} catch (error) {
			console.log(error);
		}
	} else {
		try {
			const isX2Y2 = market.name === 'X2Y2 ⭕️' ? '/items' : '';
			const tweetContent = `
			${tokenData.name} sold for ${formatPrice(totalPrice)} ETH ${ethUsdValue}

			【 Marketplace 】
			${market.name}
			
			【 From: ${from} 】
			${market.account_site}${fromAddr}${isX2Y2}
			
			【 To: ${to} 】
			${market.account_site}${toAddr}${isX2Y2}
			
			【 Link 】
			${market.site}${CONTRACT_ADDRESS}/${tokens[0]}	
			`;

			await rwClient.v1.tweet(tweetContent, { media_ids: mediaId });
		} catch (error) {
			console.log(error);
		}
	}
};

export { tweet };
