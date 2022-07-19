import { MessageEmbed, WebhookClient, MessageAttachment } from 'discord.js';
import { WEBHOOK_URLS, CONTRACT_ADDRESS, GIF_ENABLED } from '../config/setup.js';
import { formatPrice, getReadableName } from '../utils/api.js';
import { createGif, createNaImage, createSwapGif } from '../utils/image.js';
import { formatBundleField, formatSweepField } from './formatField.js';

const sendEmbedMessage = async (tx) => {
    let file;
    const embed = new MessageEmbed();
    const priceTitle = tx.quantity > 1 ? 'Total Amount' : 'Price';

    if (tx.isSwap) {
        embed
            .setTitle(`New ${tx.tokenData.collectionName} Swap on NFTTrader.io`)
            .setURL(`${tx.market.site}${tx.transactionHash}`)
            .addFields([
                {
                    name: 'Maker',
                    value: `[${tx.swap[tx.addressMaker].name}](${tx.market.accountPage}${
                        tx.addressMaker
                    })`
                },
                {
                    name: 'Taker',
                    value: `[${tx.swap[tx.addressTaker].name}](${tx.market.accountPage}${
                        tx.addressTaker
                    })`
                }
            ])
            .setFooter({ text: tx.market.name, iconURL: tx.market.iconURL })
            .setColor(tx.market.color)
            .setTimestamp();
        const gifImage = await createSwapGif(tx.swap, tx.addressMaker, tx.addressTaker);
        tx.gifImage = gifImage;
        file = new MessageAttachment(gifImage, 'image.gif');
        embed.setImage('attachment://image.gif');
    } else {
        embed
            .setURL(`${tx.market.site}${CONTRACT_ADDRESS}/${tx.tokens[0]}`)
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
                `${tx.quantity} ${tx.tokenData.collectionName} ${
                    tx.isSweep ? 'SWEPT! 🧹' : 'SOLD!'
                }`
            );
        } else {
            embed.setTitle(`${tx.tokenData.name || `${tx.tokenData.symbol} #${tx.tokenId}`} SOLD!`);
        }

        if (tx.tokenType === 'ERC721' && tx.quantity > 1 && GIF_ENABLED) {
            const gifImage = await createGif(tx.tokens);
            tx.gifImage = gifImage;
            file = new MessageAttachment(gifImage, 'image.gif');
            embed.setImage('attachment://image.gif');
        } else if (!tx.tokenData.image) {
            const naImage = await createNaImage(true);
            file = new MessageAttachment(naImage, 'image.png');
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
            formatSweepField(tx.tokens, tx.prices, tx.currency, tx.marketList, embed);
        } else {
            const from = await getReadableName(tx.fromAddr);
            const to = await getReadableName(tx.toAddr);
            const isX2Y2 = tx.market.name === 'X2Y2 ⭕️' ? '/items' : '';
            const fields = [
                {
                    name: 'From',
                    value: `[${from}](${tx.market.accountPage}${tx.fromAddr}${isX2Y2})`,
                    inline: true
                },
                {
                    name: 'To',
                    value: `[${to}](${tx.market.accountPage}${tx.toAddr}${isX2Y2})`,
                    inline: true
                }
            ];

            if (tx.tokenType === 'ERC1155' || tx.quantity > 1)
                embed.addField('Quantity', `\`${tx.quantity}\``, false);
            if (tx.tokenType === 'ERC721' && tx.quantity > 1) {
                formatBundleField(tx.tokens, tx.market, embed);
            }
            embed.addFields(fields);
            tx.from = from;
            tx.to = to;
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
