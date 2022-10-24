import { MessageEmbed, WebhookClient } from 'discord.js';
import {
    DISCORD_POST_PRICE_THRESHOLD,
    WEBHOOK_URLS,
    WHITELISTED_CURRENCIES
} from '../config/setup.js';
import type { TransactionData } from '../types';
import { formatPrice } from '../utils/api.js';
import { createSwapGif } from '../utils/image.js';
import { formatBundleField, formatSwapField, formatSweepField } from './formatField.js';

const sendEmbedMessage = async (tx: TransactionData) => {
    const embed = new MessageEmbed();
    const isAggregator = tx.recipient === 'gem' || tx.recipient === 'genie';
    const isSwap = tx.recipient === 'nft-trader';

    if (
        tx.totalPrice < DISCORD_POST_PRICE_THRESHOLD ||
        !WHITELISTED_CURRENCIES.includes(tx.currency.name.toLowerCase())
    ) {
        return tx;
    }

    if (isSwap && tx.addressMaker && tx.addressTaker) {
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
    } else if (tx.tokenData && tx.tokenData.image) {
        const priceTitle = tx.quantity > 1 ? 'Total Amount' : 'Price';

        embed
            .setURL(`${tx.market.site}${tx.contractAddress}/${tx.tokenId}`)
            .addField(
                priceTitle,
                `\`${formatPrice(tx.totalPrice)} ${tx.currency.name} ${tx.ethUsdValue}\``,
                isAggregator
            )
            .setFooter({ text: tx.market.displayName, iconURL: tx.market.iconURL })
            .setColor(tx.market.color)
            .setTimestamp();

        if (tx.quantity > 1) {
            embed.setTitle(`${tx.quantity} ${tx.contractName || tx.tokenName} SWEPT!`);
        } else {
            embed.setTitle(`${tx.tokenName} SOLD!`);
        }

        if (isAggregator) {
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
        } else if (tx.quantity) {
            const isX2Y2 = tx.market.name === 'x2y2' ? '/items' : '';

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

        webhookClient.send({
            embeds: [embed]
        });
    });

    return tx;
};

export { sendEmbedMessage };
