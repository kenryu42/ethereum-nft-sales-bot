import { MessageEmbed, WebhookClient, MessageAttachment } from 'discord.js';
import {
	WEBHOOK_URLS,
	CONTRACT_ADDRESS,
	GIF_ENABLED
} from '../config/setup.js';
import { formatPrice, getReadableName } from '../utils/api.js';
import { createGif, createNaImage } from '../utils/image.js';
import { formatBundleField, formatSweepField } from './formatField.js';

const sendEmbedMessage = async (embedConfig) => {
	const {
		market,
		tokens,
		tokenType,
		quantity,
		marketList,
		prices,
		totalPrice,
		currency,
		usdPrice,
		fromAddr,
		toAddr,
		tokenData,
		isSweep,
		sweeperAddr
	} = embedConfig;
	const priceTitle = quantity > 1 ? 'Total Amount' : 'Price';
	const ethUsdValue =
		currency.name === 'ETH' || currency.name === 'WETH'
			? `($ ${usdPrice})`
			: '';
	let file;
	embedConfig.ethUsdValue = ethUsdValue;

	const embed = new MessageEmbed()
		.setURL(`${market.site}${CONTRACT_ADDRESS}/${tokens[0]}`)
		.addField(
			priceTitle,
			`\`${formatPrice(totalPrice)} ${currency.name} ${ethUsdValue}\``,
			isSweep
		)
		.setFooter({ text: market.name, iconURL: market.iconURL })
		.setColor(market.color)
		.setTimestamp();

	if (quantity > 1) {
		embed.setTitle(
			`${quantity} ${tokenData.collectionName} ${
				isSweep ? 'SWEPT! 🧹' : 'SOLD!'
			}`
		);
	} else {
		embed.setTitle(`${tokenData.name} SOLD!`);
	}

	if (tokenType === 'ERC721' && quantity > 1 && GIF_ENABLED) {
		const gifImage = await createGif(tokens);
		embedConfig.gifImage = gifImage;
		file = new MessageAttachment(gifImage, 'image.gif');
		embed.setImage('attachment://image.gif');
	} else if (!tokenData.image) {
		const naImage = await createNaImage(true);
		file = new MessageAttachment(naImage, 'image.png');
		embed.setImage('attachment://image.png');
	} else {
		embed.setImage(tokenData.image);
	}

	if (isSweep) {
		const sweeper = await getReadableName(sweeperAddr);
		const fields = [
			{
				name: 'Quantity',
				value: `\`${quantity}\``,
				inline: true
			},
			{
				name: 'Sweeper',
				value: `[${sweeper}](${market.account_site}${sweeperAddr})`,
				inline: false
			}
		];

		embed.addFields(fields);
		formatSweepField(tokens, prices, currency, marketList, embed);
		embedConfig.sweeper = sweeper;
	} else {
		const from = await getReadableName(fromAddr);
		const to = await getReadableName(toAddr);
		const isX2Y2 = market.name === 'X2Y2 ⭕️' ? '/items' : '';
		const fields = [
			{
				name: 'From',
				value: `[${from}](${market.account_site}${fromAddr}${isX2Y2})`,
				inline: true
			},
			{
				name: 'To',
				value: `[${to}](${market.account_site}${toAddr}${isX2Y2})`,
				inline: true
			}
		];

		if (tokenType === 'ERC1155' || quantity > 1)
			embed.addField('Quantity', `\`${quantity}\``, false);
		if (tokenType === 'ERC721' && quantity > 1) {
			formatBundleField(tokens, market, embed);
		}
		embed.addFields(fields);
		embedConfig.from = from;
		embedConfig.to = to;
	}

	WEBHOOK_URLS.forEach((webhookURL) => {
		const webhookClient = new WebhookClient({ url: webhookURL });

		if (file) {
			webhookClient.send({
				embeds: [embed],
				files: [file]
			});
		} else {
			webhookClient.send({
				embeds: [embed]
			});
		}
	});

	return embedConfig;
};

export { sendEmbedMessage };
