import sharp from 'sharp';
import { formatPrice, getArrayBuffer } from '../utils/api.js';
import { WEBHOOK_URLS, GIF_ENABLED } from '../config/setup.js';
import { formatSweepField, formatSwapField } from './formatField.js';
import { MessageEmbed, WebhookClient, MessageAttachment } from 'discord.js';
import { createGif, createTextImage, createSwapGif } from '../utils/image.js';

import type { TransactionData } from '../types';

const handleSWapField = async (tx: TransactionData, embed: MessageEmbed) => {
    if (!tx.addressMaker || !tx.addressTaker) throw new Error('Missing swap address');

    const gifImage = await createSwapGif(tx.swap, tx.addressMaker, tx.addressTaker);

    embed.addField(
        'Maker',
        `[${tx.swap[tx.addressMaker as keyof typeof tx.swap].name}](${tx.market.accountPage}${
            tx.addressMaker
        })`
    );
    await formatSwapField(tx.swap, tx.addressMaker, embed);

    embed.addField(
        'Taker',
        `[${tx.swap[tx.addressTaker as keyof typeof tx.swap].name}](${tx.market.accountPage}${
            tx.addressTaker
        })`
    );
    await formatSwapField(tx.swap, tx.addressTaker, embed);

    embed
        .setTitle(`New ${tx.contractName || tx.tokenName} Swap!`)
        .setURL(`${tx.market.site}${tx.transactionHash}`)
        .setFooter({ text: tx.market.displayName, iconURL: tx.market.iconURL })
        .setColor(tx.market.color)
        .setTimestamp();
    tx.gifImage = gifImage;
    embed.setImage('attachment://image.gif');

    return new MessageAttachment(gifImage as Buffer, 'image.gif');
};

const handleBasicField = (tx: TransactionData, embed: MessageEmbed, isAggregator: boolean) => {
    const priceTitle = tx.quantity > 1 ? 'Total Amount' : 'Price';
    const price = formatPrice(tx.totalPrice);
    const priceField =
        price === '0'
            ? `\`${price} ${tx.currency.name} (Possibly stolen. 🚨)\``
            : `\`${formatPrice(tx.totalPrice)} ${tx.currency.name} ${tx.ethUsdValue}\``;

    embed
        .setURL(`${tx.market.site}${tx.contractAddress}/${tx.tokenId}`)
        .addField(priceTitle, priceField, isAggregator)
        .setFooter({ text: tx.market.displayName, iconURL: tx.market.iconURL })
        .setColor(tx.market.color)
        .setTimestamp();

    if (tx.quantity > 1) {
        embed.setTitle(`${tx.quantity} ${tx.contractName || tx.tokenName} SWEPT!`);
    } else {
        embed.setTitle(`${tx.tokenName} SOLD!`);
    }
};

const handleAdvancedField = (tx: TransactionData, embed: MessageEmbed, isAggregator: boolean) => {
    if (isAggregator || (tx.tokenType === 'ERC721' && tx.quantity > 1)) {
        const fields = [
            {
                name: 'Sweeper',
                value: `[${tx.sweeper || tx.to}](${tx.market.accountPage}${
                    tx.sweeperAddr || tx.toAddr
                })`,
                inline: false
            }
        ];

        embed.addFields(fields);
        formatSweepField(tx, embed);
    } else if (tx.tokenType === 'ERC1155' || tx.quantity > 1) {
        const isX2Y2 = tx.market.name === 'x2y2' ? '/items' : '';

        embed
            .addField('Quantity', `\`${tx.quantity}\``, false)
            .addField('From', `[${tx.from}](${tx.market.accountPage}${tx.fromAddr}${isX2Y2})`, true)
            .addField('To', `[${tx.to}](${tx.market.accountPage}${tx.toAddr}${isX2Y2})`, true);
    } else if (tx.tokenType === 'ERC721' && tx.quantity === 1) {
        embed
            .addField('From', `[${tx.from}](${tx.market.accountPage}${tx.fromAddr})`, true)
            .addField('To', `[${tx.to}](${tx.market.accountPage}${tx.toAddr})`, true);
    }
};

const handleImageField = async (tx: TransactionData, embed: MessageEmbed) => {
    if (!tx.tokenData) throw new Error('Missing token data');

    let file;

    if (tx.tokenType === 'ERC721' && tx.quantity > 1 && GIF_ENABLED) {
        const gifImage = await createGif(tx.tokens, tx.contractAddress, tx.tokenType);

        tx.gifImage = gifImage;
        file = new MessageAttachment(gifImage as Buffer, 'image.gif');
        embed.setImage('attachment://image.gif');
    } else if (!tx.tokenData.image) {
        const naImage = await createTextImage('Content not available yet', true);

        file = new MessageAttachment(naImage, 'image.png');
        embed.setImage('attachment://image.png');
    } else if (tx.tokenData.image.endsWith('.svg')) {
        const arrayBuffer = await getArrayBuffer(tx.tokenData.image);
        const image = await sharp(arrayBuffer).png().toBuffer();

        file = new MessageAttachment(image, 'image.png');
        embed.setImage('attachment://image.png');
    } else if (tx.tokenData.image.startsWith('data:image/svg+xml;base64,')) {
        const base64Image = tx.tokenData.image.replace('data:image/svg+xml;base64,', '');
        const buffer = Buffer.from(base64Image, 'base64');
        const image = await sharp(buffer).png().toBuffer();

        file = new MessageAttachment(image, 'image.png');
        embed.setImage('attachment://image.png');
    } else {
        const arrayBuffer = await getArrayBuffer(tx.tokenData.image);
        const buffer = Buffer.from(arrayBuffer, 'binary');
        const fileName = `${tx.tokenId}.png`;

        file = new MessageAttachment(buffer, fileName);
        embed.setImage(`attachment://${fileName}`);
        // embed.setImage(tx.tokenData.image);
    }

    return file;
};

const sendEmbedMessage = (webhookUrls: string[], embed: MessageEmbed, file: MessageAttachment) => {
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
};

const handleEmbedMessage = async (tx: TransactionData) => {
    const embed = new MessageEmbed();
    const isAggregator =
        tx.recipient === 'gem' || tx.recipient === 'genie' || tx.recipient === 'blurSwap';
    const isSwap = tx.recipient === 'nft-trader';

    if (isSwap) {
        const attachmentFile = await handleSWapField(tx, embed);

        sendEmbedMessage(WEBHOOK_URLS, embed, attachmentFile);
    } else if (tx.tokenData && tx.tokenData.image) {
        const attachmentFile = await handleImageField(tx, embed);

        handleBasicField(tx, embed, isAggregator);
        handleAdvancedField(tx, embed, isAggregator);
        sendEmbedMessage(WEBHOOK_URLS, embed, attachmentFile);
    }

    return tx;
};

export { handleEmbedMessage };
