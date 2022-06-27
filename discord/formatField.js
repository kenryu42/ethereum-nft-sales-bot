import { CONTRACT_ADDRESS } from '../config/setup.js';

const formatSweepField = (tokens, prices, currency, marketList, embed) => {
	const customField = {};
	const sep = '\n\n';

	for (let i = 0; i < tokens.length; i++) {
		const currentMarket = marketList[i].name;

		if (!(currentMarket in customField)) {
			customField[currentMarket] = [];
		}
		const value = `[\`# ${String(tokens[i]).padStart(4, '0')}\`  ┇  Price: \`${
			prices[i]
		}\` ${currency.name}](${marketList[i].site}${CONTRACT_ADDRESS}/${
			tokens[i]
		})`;
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

const formatBundleField = (tokens, market, embed) => {
	let values = '';
	const sep = '\xa0\xa0\xa0\xa0\xa0\xa0';

	for (const token of tokens) {
		const value =
			`**[# ${String(token).padStart(4, '0')}](${
				market.site
			}${CONTRACT_ADDRESS}/${token})**` + sep;
		if ((values + value).length > 1024) {
			embed.addField('Token Id', values);
			values = '';
		}
		values += value;
	}
	embed.addField('Token Id', values);
};

export { formatSweepField, formatBundleField };
