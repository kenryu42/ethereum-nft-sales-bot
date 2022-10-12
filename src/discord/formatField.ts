import { getEthUsdPrice } from '../utils/api.js';
import type { SwapData, TransactionData } from '../types';
import { MessageEmbed } from 'discord.js';

const formatSweepField = (tx: TransactionData, embed: MessageEmbed) => {
    const customField: Record<string, string[]> = {};
    const sep = '\n\n';

    for (let i = 0; i < tx.tokens.length; i++) {
        const currentMarket = tx.marketList[i].displayName;

        if (!(currentMarket in customField)) {
            customField[currentMarket] = [];
        }
        const value = `[\`# ${String(tx.tokens[i]).padStart(4, '0')}\`  ┇  Price: \`${
            tx.prices[i]
        }\` ${tx.currency.name}](${tx.marketList[i].site}${tx.contractAddress}/${tx.tokens[i]})`;
        customField[currentMarket].push(value);
    }

    for (const market in customField) {
        let value = '';

        customField[market].forEach((token) => {
            if ((value + token + sep).length > 1024) {
                embed.addField(market, value);
                value = '';
            }
            value += token + sep;
        });
        embed.addField(market, value);
    }
};

const formatBundleField = (tx: TransactionData, embed: MessageEmbed) => {
    let i = 0;
    let values = '';

    for (const token of tx.tokens) {
        const sep = ++i % 4 === 0 ? '\n' : '\xa0\xa0\xa0\xa0\xa0\xa0';
        const value =
            `**[\`#${String(token).padStart(4, '0')}\`](${tx.market.site}${
                tx.contractAddress
            }/${token})**` + sep;
        if ((values + value).length > 1024) {
            embed.addField('Token Id', values);
            values = '';
        }
        values += value;
    }
    embed.addField('Token Id', values);
};

const formatSwapField = async (swap: SwapData, address: string, embed: MessageEmbed) => {
    let values = '';
    const sep = '\n';
    const spentAssets = swap[address].spentAssets ?? [];

    for (const asset of spentAssets) {
        const value =
            `[${asset.name}](https://opensea.io/assets/ethereum/${asset.contractAddress}/${asset.tokenId})` +
            sep;
        if ((values + value).length > 1024) {
            embed.addField('Spent Assets', values);
            values = '';
        }
        values += value;
    }
    values = values || '`-`';
    embed.addField('Spent Assets', values);
    const usdValue = await getEthUsdPrice(Number(swap[address].spentAmount));
    const usdPrice = usdValue !== '0' ? ` ($ ${usdValue})` : '';
    const spentAmount =
        swap[address].spentAmount !== '0.0'
            ? `\`${swap[address].spentAmount} ETH${usdPrice}\``
            : '`-`';
    embed.addField('Spent Amount', spentAmount);
};

export { formatSweepField, formatBundleField, formatSwapField };
