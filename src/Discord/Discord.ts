import axios from 'axios';
import retry from 'async-retry';
import FormData from 'form-data';
import { getEthUsdPrice } from '../api/api.js';
import { formatPrice } from '../utils/helper.js';
import { Logger, log } from '../Logger/index.js';
import { createGif, createSwapGif, parseImage } from '../utils/image.js';

import type { TransactionData } from '../types/models/transaction.model.js';
import type { Config, Options } from '../types/interfaces/enft.interface.js';

interface EmbedConfig {
    tx: TransactionData;
    config: Config;
    options: Options;
}

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
 * A class that handles the sending of Discord embeds.
 *
 * @class
 **/
export class Discord {
    private tx: TransactionData;
    private readonly data: FormData = new FormData();
    private readonly embed: Embed = { fields: [] };
    private readonly config: Config;
    private readonly options: Options;

    constructor(embedConfig: EmbedConfig) {
        this.tx = embedConfig.tx;
        this.config = embedConfig.config;
        this.options = embedConfig.options;
    }

    /**
     *
     * A method that handle Discord webhooks and send the embed message, given the transaction information.
     *
     * @async
     * @function
     **/
    handleDiscordWebhook = async (): Promise<void> => {
        if (this.tx.swap) {
            await this.setSwapFields();
        } else {
            await this.setImageField();
            this.setBasicFields();
            this.setAdvancedFields();
        }
        this.sendEmbedMessage();
    };

    /**
     *
     * A method that set some basic fields for the discord embed.
     *
     * @private
     * @function
     **/
    private setBasicFields = (): void => {
        const tokenId = Object.keys(this.tx.tokens)[0];
        const tokenData = this.tx.tokens[tokenId];
        const priceTitle = this.tx.totalAmount > 1 ? 'Total Price' : 'Price';
        const price = formatPrice(this.tx.totalPrice);
        const priceField =
            price === '0'
                ? `\`${price} ${this.tx.currency.name} (Possibly stolen. 🚨)\``
                : `\`${formatPrice(this.tx.totalPrice)} ${
                      this.tx.currency.name
                  } ${this.tx.usdPrice ? `($ ${this.tx.usdPrice})` : ''}\``;

        this.embed.url = `${this.tx.interactedMarket.site}${this.tx.contractAddress}/${tokenData.tokenId}`;
        this.embed.fields.push({
            name: priceTitle,
            value: priceField,
            inline: this.tx.totalAmount > 1
        });
        this.embed.footer = {
            text: this.tx.interactedMarket.displayName,
            icon_url: this.tx.interactedMarket.iconURL
        };
        this.embed.color = this.tx.interactedMarket.color;
        this.embed.timestamp = new Date(Date.now()).toISOString();

        if (this.tx.totalAmount > 1) {
            this.embed.title = `${this.tx.totalAmount} ${
                this.tx.contractData.name ||
                this.tx.contractData.symbol ||
                tokenData.name
            } ${this.tx.isBlurBid ? 'SOLD' : 'SWEPT'}!`;
        } else {
            this.embed.title = `${
                tokenData.name || `${this.tx.contractData.symbol} #${tokenId}`
            } SOLD!`;
        }
    };

    /**
     *
     * A private method that set some advanced fields for the discord embed.
     *
     * @private
     * @function
     **/
    private setAdvancedFields = (): void => {
        if (this.tx.totalAmount > 1 || this.tx.isAggregator) {
            const name = this.tx.isBlurBid
                ? 'Seller'
                : this.tx.totalAmount > 1
                ? 'Sweeper'
                : 'Buyer';

            const field = {
                name: name,
                value: `[${this.tx.toAddrName}](${this.tx.interactedMarket.accountPage}${this.tx.toAddr})`,
                inline: false
            };

            this.embed.fields.push(field);

            if (!this.tx.swap) this.formatSweepFields();
        } else {
            const isX2Y2 =
                this.tx.interactedMarket.name === 'x2y2' ? '/items' : '';

            this.embed.fields.push(
                ...[
                    {
                        name: 'From',
                        value: `[${this.tx.fromAddrName}](${this.tx.interactedMarket.accountPage}${this.tx.fromAddr}${isX2Y2})`,
                        inline: true
                    },
                    {
                        name: 'To',
                        value: `[${this.tx.toAddrName}](${this.tx.interactedMarket.accountPage}${this.tx.toAddr}${isX2Y2})`,
                        inline: true
                    }
                ]
            );

            if (this.tx.isAggregator) {
                this.formatSweepFields();
            }
        }
    };

    /**
     *
     * A private method that sets the image field in the embed.
     *
     * @private
     * @async
     * @function
     **/
    private setImageField = async (): Promise<void> => {
        const tokenId = Object.keys(this.tx.tokens)[0];
        const token = this.tx.tokens[tokenId];
        const tokenVariants = Object.keys(this.tx.tokens).length;

        if (tokenVariants > 1) {
            this.tx.gifImage = await createGif(this.tx.tokens);

            this.data.append('file', this.tx.gifImage, 'image.gif');
            this.embed.image = { url: 'attachment://image.gif' };
        } else {
            const sharpImage = await parseImage(token.image);
            const imageBuffer = await sharpImage.resize(512).png().toBuffer();
            const fileName = `${tokenId}.png`;

            this.data.append('file', imageBuffer, fileName);
            this.embed.image = { url: `attachment://${fileName}` };
        }
    };

    /**
     *
     * A private method that set the swap fields for the discord embed.
     *
     * @private
     * @async
     * @function
     **/
    private setSwapFields = async (): Promise<void> => {
        if (!this.tx.swap) return;

        const titleName =
            this.tx.contractData.name || this.tx.contractData.symbol;

        this.tx.gifImage = await createSwapGif(this.tx.swap, this.config);
        this.embed.fields.push({
            name: 'Maker',
            value: `[${this.tx.swap.maker.name}](${this.tx.interactedMarket.accountPage}${this.tx.swap.maker.address})`
        });
        await this.formatSwapFields('maker');

        this.embed.fields.push({
            name: 'Taker',
            value: `[${this.tx.swap.taker.name}](${this.tx.interactedMarket.accountPage}${this.tx.swap.taker.address})`
        });
        await this.formatSwapFields('taker');

        this.embed.title = `New ${
            titleName ? `${titleName} Swap!` : 'Swap on NftTrader!'
        }`;
        this.embed.url = `${this.tx.interactedMarket.site}${this.tx.transactionHash}`;
        this.embed.footer = {
            text: this.tx.interactedMarket.displayName,
            icon_url: this.tx.interactedMarket.iconURL
        };
        this.embed.color = this.tx.interactedMarket.color;
        this.embed.timestamp = new Date(Date.now()).toISOString();
        this.embed.image = { url: 'attachment://image.gif' };
        this.data.append('file', this.tx.gifImage, 'image.gif');
    };

    /**
     *
     * A private method that format sweep fields for the discord embed.
     *
     * @private
     * @function
     **/
    private formatSweepFields = (): void => {
        const customField: Record<string, string[]> = {};
        const sep = '\n';

        for (const tokenId in this.tx.tokens) {
            const tokenData = this.tx.tokens[tokenId];
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
                }](${currentMarket.market.site}${
                    this.tx.contractAddress
                }/${tokenId})`;
                customField[marketName].push(value);
            }
        }

        for (const market in customField) {
            let values = '';

            customField[market].forEach((token) => {
                if ((values + token + sep).length > 1024) {
                    // this.embed.addFields(market, value);
                    this.embed.fields.push({ name: market, value: values });
                    values = '';
                }
                values += token + sep;
            });
            // this.embed.addField(market, value);
            this.embed.fields.push({ name: market, value: values });
        }
    };

    /**
     *
     * A private method that format swap fields for the discord embed.
     *
     * @private
     * @async
     * @function
     * @param {string} takerOrMaker - The taker or maker of the swap.
     **/
    private formatSwapFields = async (
        takerOrMaker: 'taker' | 'maker'
    ): Promise<void> => {
        if (!this.tx.swap) return;

        let values = '';
        const sep = '\n';
        const spentAssets = this.tx.swap[takerOrMaker].spentAssets ?? [];

        for (const asset of spentAssets) {
            const value =
                `[${asset.name} ${
                    asset.amount && asset.amount > 1 ? ` x ${asset.amount}` : ''
                }](https://opensea.io/assets/ethereum/${
                    asset.contractAddress
                }/${asset.tokenId})` + sep;
            if ((values + value).length > 1024) {
                this.embed.fields.push({ name: 'Spent Assets', value: values });
                values = '';
            }
            values += value;
        }

        values = values || '`-`';
        this.embed.fields.push({ name: 'Spent Assets', value: values });

        const usdValue = this.options.etherscanApiKey
            ? await getEthUsdPrice(
                  Number(this.tx.swap[takerOrMaker].spentAmount),
                  this.options.etherscanApiKey
              )
            : '0';
        const usdPrice = usdValue !== '0' ? ` ($ ${usdValue})` : '';
        const spentAmount =
            Number(this.tx.swap[takerOrMaker].spentAmount) > 0
                ? `\`${this.tx.swap[takerOrMaker].spentAmount} ETH${usdPrice}\``
                : '`-`';

        this.embed.fields.push({ name: 'Spent Amount', value: spentAmount });
    };

    /**
     *
     * A private method that sends the embed message containing token information.
     *
     * @private
     * @async
     * @function
     **/
    private sendEmbedMessage = async (): Promise<void> => {
        this.data.append(
            'payload_json',
            JSON.stringify({ embeds: [this.embed] })
        );
        if (!this.options.discordWebhook) {
            throw log.throwMissingArgumentError('discordWebhook', {
                location: Logger.location.DISCORD_SEND_EMBED_MESSAGE
            });
        }
        const webhookURL = this.options.discordWebhook;
        const config = {
            headers: {
                ...this.data.getHeaders()
            }
        };

        await retry(async () => {
            await axios.post(webhookURL, this.data, config);
        });
    };
}
