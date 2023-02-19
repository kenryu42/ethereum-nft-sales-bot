import axios from 'axios';
import retry from 'async-retry';
import FormData from 'form-data';
import { getEthUsdPrice } from '../api/api.js';
import { formatPrice } from '../utils/helper.js';
import { Logger, log } from '../Logger/index.js';
import { createGif, createSwapGif, parseImage } from '../utils/image.js';

import type { TransactionData } from '../types/models/transaction.model.js';
import type { Config, Options } from '../types/interfaces/enft.interface.js';

interface Embed {
    title?: string;
    description?: string;
    url?: string;
    color?: number;
    image?: {
        url: string;
    };
    fields: {
        name: string;
        value: string;
        inline?: boolean;
    }[];
    timestamp?: string;
    footer?: {
        text: string;
        icon_url?: string;
    };
}

/**
 *
 * A method that handle Discord webhooks and send the embed message, given the transaction information.
 *
 * @async
 * @function
 **/
const handleEmbedMessage = async (
    tx: TransactionData,
    config: Config,
    options: Options
): Promise<void> => {
    const embed = createEmbed();
    const data = new FormData();

    if (!options.discordWebhook) {
        throw log.throwMissingArgumentError('discordWebhook', {
            location: Logger.location.DISCORD_HANDLE_DISCORD_WEBHOOK
        });
    }

    if (tx.swap) {
        await setSwapFields(tx, embed, data, config, options);
    } else {
        await setImageField(tx, embed, data);
        setBasicFields(tx, embed);
        setAdvancedFields(tx, embed);
    }
    sendEmbedMessage(embed, data, options.discordWebhook);
};

const createEmbed = (): Embed => ({ fields: [] });

/**
 *
 * A method that set some basic fields for the discord embed.
 *
 * @function
 **/
const setBasicFields = (tx: TransactionData, embed: Embed): void => {
    const tokenId = Object.keys(tx.tokens)[0];
    const tokenData = tx.tokens[tokenId];
    const priceTitle = tx.totalAmount > 1 ? 'Total Price' : 'Price';
    const price = formatPrice(tx.totalPrice);
    const priceField =
        price === '0'
            ? `\`${price} ${tx.currency.name} (Possibly stolen. 🚨)\``
            : `\`${formatPrice(tx.totalPrice)} ${tx.currency.name} ${
                  tx.usdPrice ? `($ ${tx.usdPrice})` : ''
              }\``;

    embed.url = `${tx.interactedMarket.site}${tx.contractAddress}/${tokenData.tokenId}`;
    embed.fields.push({
        name: priceTitle,
        value: priceField,
        inline: tx.totalAmount > 1
    });
    embed.footer = {
        text: tx.interactedMarket.displayName,
        icon_url: tx.interactedMarket.iconURL
    };
    embed.color = tx.interactedMarket.color;
    embed.timestamp = new Date(Date.now()).toISOString();

    if (tx.totalAmount > 1) {
        embed.title = `${tx.totalAmount} ${
            tx.contractData.name || tx.contractData.symbol || tokenData.name
        } ${tx.isBlurBid ? 'SOLD' : 'SWEPT'}!`;
    } else {
        embed.title = `${
            tokenData.name || `${tx.contractData.symbol} #${tokenId}`
        } SOLD!`;
    }
};

/**
 *
 * A private method that set some advanced fields for the discord embed.
 *
 * @function
 **/
const setAdvancedFields = (tx: TransactionData, embed: Embed): void => {
    if (tx.totalAmount > 1 || tx.isAggregator) {
        const name = tx.isBlurBid
            ? 'Seller'
            : tx.totalAmount > 1
            ? 'Sweeper'
            : 'Buyer';

        const field = {
            name: name,
            value: `[${tx.toAddrName}](${tx.interactedMarket.accountPage}${tx.toAddr})`,
            inline: false
        };

        embed.fields.push(field);

        if (!tx.swap) formatSweepFields(tx, embed);
    } else {
        const isX2Y2 = tx.interactedMarket.name === 'x2y2' ? '/items' : '';

        embed.fields.push(
            ...[
                {
                    name: 'From',
                    value: `[${tx.fromAddrName}](${tx.interactedMarket.accountPage}${tx.fromAddr}${isX2Y2})`,
                    inline: true
                },
                {
                    name: 'To',
                    value: `[${tx.toAddrName}](${tx.interactedMarket.accountPage}${tx.toAddr}${isX2Y2})`,
                    inline: true
                }
            ]
        );

        if (tx.isAggregator) {
            formatSweepFields(tx, embed);
        }
    }
};

/**
 *
 * A private method that sets the image field in the embed.
 *
 * @async
 * @function
 **/
const setImageField = async (
    tx: TransactionData,
    embed: Embed,
    data: FormData
): Promise<void> => {
    const tokenId = Object.keys(tx.tokens)[0];
    const token = tx.tokens[tokenId];
    const tokenVariants = Object.keys(tx.tokens).length;

    if (tokenVariants > 1) {
        tx.gifImage = await createGif(tx.tokens);

        data.append('file', tx.gifImage, 'image.gif');
        embed.image = { url: 'attachment://image.gif' };
    } else {
        const sharpImage = await parseImage(token.image);
        const imageBuffer = await sharpImage.resize(512).png().toBuffer();
        const fileName = `${tokenId}.png`;

        data.append('file', imageBuffer, fileName);
        embed.image = { url: `attachment://${fileName}` };
    }
};

/**
 *
 * A private method that set the swap fields for the discord embed.
 *
 * @async
 * @function
 **/
const setSwapFields = async (
    tx: TransactionData,
    embed: Embed,
    data: FormData,
    config: Config,
    options: Options
): Promise<void> => {
    if (!tx.swap) return;

    const titleName = tx.contractData.name || tx.contractData.symbol;

    tx.gifImage = await createSwapGif(tx.swap, config);
    embed.fields.push({
        name: 'Maker',
        value: `[${tx.swap.maker.name}](${tx.interactedMarket.accountPage}${tx.swap.maker.address})`
    });
    await formatSwapFields('maker', tx, embed, options);

    embed.fields.push({
        name: 'Taker',
        value: `[${tx.swap.taker.name}](${tx.interactedMarket.accountPage}${tx.swap.taker.address})`
    });
    await formatSwapFields('taker', tx, embed, options);

    embed.title = `New ${
        titleName ? `${titleName} Swap!` : 'Swap on NftTrader!'
    }`;
    embed.url = `${tx.interactedMarket.site}${tx.transactionHash}`;
    embed.footer = {
        text: tx.interactedMarket.displayName,
        icon_url: tx.interactedMarket.iconURL
    };
    embed.color = tx.interactedMarket.color;
    embed.timestamp = new Date(Date.now()).toISOString();
    embed.image = { url: 'attachment://image.gif' };
    data.append('file', tx.gifImage, 'image.gif');
};

/**
 *
 * A private method that format sweep fields for the discord embed.
 *
 * @function
 **/
const formatSweepFields = (tx: TransactionData, embed: Embed): void => {
    const customField: Record<string, string[]> = {};
    const sep = '\n';

    for (const tokenId in tx.tokens) {
        const tokenData = tx.tokens[tokenId];
        for (const market in tokenData.markets) {
            const currentMarket = tokenData.markets[market];
            const marketName = currentMarket.market.displayName;
            const swept = currentMarket.amount > 1;

            if (!(marketName in customField)) {
                customField[marketName] = [];
            }
            const value = `[# \`${tokenId.padStart(4, '0')}\`  ${
                swept ? ` x \`${currentMarket.amount}\` = ` : '  ┇  Price: '
            } \`${currentMarket.price.value}\` ${
                currentMarket.price.currency.name
            }](${currentMarket.market.site}${tx.contractAddress}/${tokenId})`;
            customField[marketName].push(value);
        }
    }

    for (const market in customField) {
        let values = '';

        customField[market].forEach((token) => {
            if ((values + token + sep).length > 1024) {
                embed.fields.push({ name: market, value: values });
                values = '';
            }
            values += token + sep;
        });
        embed.fields.push({ name: market, value: values });
    }
};

/**
 *
 * A private method that format swap fields for the discord embed.
 *
 * @async
 * @function
 * @param {string} takerOrMaker - The taker or maker of the swap.
 **/
const formatSwapFields = async (
    takerOrMaker: 'taker' | 'maker',
    tx: TransactionData,
    embed: Embed,
    options: Options
): Promise<void> => {
    if (!tx.swap) return;

    let values = '';
    const sep = '\n';
    const spentAssets = tx.swap[takerOrMaker].spentAssets ?? [];

    for (const asset of spentAssets) {
        const value =
            `[${asset.name} ${
                asset.amount && asset.amount > 1 ? ` x ${asset.amount}` : ''
            }](https://opensea.io/assets/ethereum/${asset.contractAddress}/${
                asset.tokenId
            })` + sep;
        if ((values + value).length > 1024) {
            embed.fields.push({ name: 'Spent Assets', value: values });
            values = '';
        }
        values += value;
    }

    values = values || '`-`';
    embed.fields.push({ name: 'Spent Assets', value: values });

    const usdValue = options.etherscanApiKey
        ? await getEthUsdPrice(
              Number(tx.swap[takerOrMaker].spentAmount),
              options.etherscanApiKey
          )
        : '0';
    const usdPrice = usdValue !== '0' ? ` ($ ${usdValue})` : '';
    const spentAmount =
        Number(tx.swap[takerOrMaker].spentAmount) > 0
            ? `\`${tx.swap[takerOrMaker].spentAmount} ETH${usdPrice}\``
            : '`-`';

    embed.fields.push({ name: 'Spent Amount', value: spentAmount });
};

/**
 *
 * A private method that sends the embed message containing token information.
 *
 * @private
 * @async
 * @function
 **/
const sendEmbedMessage = async (
    embed: Embed,
    data: FormData,
    webhookUrl: string
): Promise<void> => {
    data.append('payload_json', JSON.stringify({ embeds: [embed] }));

    const config = {
        headers: {
            ...data.getHeaders()
        }
    };

    await retry(async () => {
        await axios.post(webhookUrl, data, config);
    });
};

export { handleEmbedMessage };
