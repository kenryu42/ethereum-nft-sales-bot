import axios from 'axios';
import sharp from 'sharp';
import { formatPrice } from '../utils/api.js';
import { createGif, createNaImage, createSwapGif } from '../utils/image.js';
import { MessageEmbed, WebhookClient, MessageAttachment } from 'discord.js';
import { WEBHOOK_URLS, GIF_ENABLED } from '../config/setup.js';
import { formatBundleField, formatSweepField, formatSwapField } from './formatField.js';

const sendEmbedMessage = async (tx) => {
    let file;
    const embed = new MessageEmbed();

    if (tx.isSwap) {
        const gifImage = await createSwapGif(tx.swap, tx.addressMaker, tx.addressTaker);

        embed.addField(
            'Maker',
            `[${tx.swap[tx.addressMaker].name}](${tx.market.accountPage}${tx.addressMaker})`
        );
        await formatSwapField(tx.swap, tx.addressMaker, embed);

        embed.addField(
            'Taker',
            `[${tx.swap[tx.addressTaker].name}](${tx.market.accountPage}${tx.addressTaker})`
        );
        await formatSwapField(tx.swap, tx.addressTaker, embed);

        embed
            .setTitle(`New ${tx.contractName || tx.tokenName} Swap on NFT Trader`)
            .setURL(`${tx.market.site}${tx.transactionHash}`)
            .setFooter({ text: tx.market.name, iconURL: tx.market.iconURL })
            .setColor(tx.market.color)
            .setTimestamp();
        tx.gifImage = gifImage;
        file = new MessageAttachment(gifImage, 'image.gif');
        embed.setImage('attachment://image.gif');
    } else {
        const priceTitle = tx.quantity > 1 ? 'Total Amount' : 'Price';

        embed
            .setURL(`${tx.market.site}${tx.contractAddress}/${tx.tokenId}`)
            .addField(
                priceTitle,
                `\`${formatPrice(tx.totalPrice)} ${tx.currency.name} ${tx.ethUsdValue}\``,
                tx.isSweep
            )
            .setFooter({ text: tx.market.name, iconURL: tx.market.iconURL })
            .setColor(tx.market.color)
            .setTimestamp();

        if (tx.quantity > 1) {
            embed.setTitle(
                `${tx.quantity} ${tx.contractName || tx.tokenName} ${
                    tx.isSweep ? 'SWEPT!' : 'SOLD!'
                }`
            );
        } else {
            embed.setTitle(`${tx.tokenName} SOLD!`);
        }

        if (tx.tokenType === 'ERC721' && tx.quantity > 1 && GIF_ENABLED) {
            const gifImage = await createGif(tx.tokens, tx.contractAddress, tx.tokenType);

            tx.gifImage = gifImage;
            file = new MessageAttachment(gifImage, 'image.gif');
            embed.setImage('attachment://image.gif');
        } else if (!tx.tokenData.image) {
            const naImage = await createNaImage(true);

            file = new MessageAttachment(naImage, 'image.png');
            embed.setImage('attachment://image.png');
        } else if (tx.tokenData.image.endsWith('.svg')) {
            const buffer = await axios.get(tx.tokenData.image, {
                responseType: 'arraybuffer'
            });
            const image = await sharp(buffer.data).png().toBuffer();

            file = new MessageAttachment(image, 'image.png');
            embed.setImage('attachment://image.png');
        } else if (tx.tokenData.image.startsWith('data:image/svg+xml;base64,')) {
            const base64Image = tx.tokenData.image.replace('data:image/svg+xml;base64,', '');
            const buffer = Buffer.from(base64Image, 'base64');
            const image = await sharp(buffer).png().toBuffer();

            file = new MessageAttachment(image, 'image.png');
            embed.setImage('attachment://image.png');
        } else {
            embed.setImage(tx.tokenData.image);
        }

        if (tx.isSweep) {
            const fields = [
                {
                    name: 'Quantity',
                    value: `\`${tx.quantity}\``,
                    inline: true
                },
                {
                    name: 'Sweeper',
                    value: `[${tx.sweeper}](${tx.market.accountPage}${tx.sweeperAddr})`,
                    inline: false
                }
            ];

            embed.addFields(fields);
            formatSweepField(tx, embed);
        } else {
            const isX2Y2 = tx.market.name === 'X2Y2 ⭕️' ? '/items' : '';

            if (tx.tokenType === 'ERC1155' || tx.quantity > 1)
                embed.addField('Quantity', `\`${tx.quantity}\``, false);

            if (tx.tokenType === 'ERC721' && tx.quantity > 1) {
                formatBundleField(tx, embed);
                embed.addField(
                    'Sweeper',
                    `[${tx.to}](${tx.market.accountPage}${tx.toAddr}${isX2Y2})`,
                    true
                );
            } else {
                embed
                    .addField(
                        'From',
                        `[${tx.from}](${tx.market.accountPage}${tx.fromAddr}${isX2Y2})`,
                        true
                    )
                    .addField(
                        'To',
                        `[${tx.to}](${tx.market.accountPage}${tx.toAddr}${isX2Y2})`,
                        true
                    );
            }
        }
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

    return tx;
};

export { sendEmbedMessage };
