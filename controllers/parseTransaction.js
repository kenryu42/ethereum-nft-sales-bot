import { ethers } from 'ethers';
import _ from 'lodash';
import { markets } from '../config/markets.js';
import { currencies } from '../config/currencies.js';
import { transferEventTypes, saleEventTypes } from '../config/logEventTypes.js';
import {
	formatPrice,
	getTokenData,
	getTransactionReceipt,
	getEthUsdPrice
} from '../utils/api.js';

function reducer(previous, current) {
	const currency = currencies[current.token.toLowerCase()];
	const result =
		previous +
		Number(ethers.utils.formatUnits(current.amount, currency.decimals));

	return result;
}
async function parseTransaction(
	web3,
	transactionHash,
	contractAddress,
	tokenType
) {
	const receipt = await getTransactionReceipt(web3, transactionHash);
	const recipient = receipt.to.toLowerCase();

	if (!(recipient in markets)) {
		return null;
	}

	const prices = [];
	const marketList = [];
	const market = _.get(markets, recipient);
	const isSweep = market.name === 'Gem.XYZ 💎' || market.name === 'Genie 🧞‍♂️';
	let tokens = [];
	let tokenId;
	let totalPrice = 0;
	let fromAddr = '';
	let toAddr = '';
	let currency = {
		name: 'ETH',
		decimals: 18
	};

	for (const log of receipt.logs) {
		const logAddress = log.address.toLowerCase();
		const logMarket = _.get(markets, logAddress);

		if (logAddress in currencies && !isSweep) {
			currency = currencies[logAddress];
		}

		if (
			log.data === '0x' &&
			transferEventTypes[tokenType] === log.topics[0] &&
			logAddress === contractAddress.toLowerCase()
		) {
			fromAddr = web3.eth.abi.decodeParameter('address', log.topics[1]);
			toAddr = web3.eth.abi.decodeParameter('address', log.topics[2]);
			tokenId = web3.utils.hexToNumberString(log.topics[3]);
			tokens.push(tokenId);
			tokens = _.uniq(tokens);
		} else if (
			transferEventTypes[tokenType] === log.topics[0] &&
			logAddress === contractAddress.toLowerCase()
		) {
			fromAddr = web3.eth.abi.decodeParameter('address', log.topics[2]);
			toAddr = web3.eth.abi.decodeParameter('address', log.topics[3]);
			const decodeData = web3.eth.abi.decodeLog(
				[
					{ type: 'uint256', name: 'id' },
					{ type: 'uint256', name: 'value' }
				],
				log.data,
				[]
			);
			tokenId = decodeData.id;
			tokens.push(Number(decodeData.value));
		}

		const isSale =
			logAddress === recipient && saleEventTypes.includes(log.topics[0]);
		const isAggregatorSale =
			logAddress in markets && saleEventTypes.includes(log.topics[0]);

		if (isSale || isAggregatorSale) {
			const marketLogDecoder = isSale
				? market.logDecoder
				: markets[logAddress].logDecoder;
			const decodedLogData = web3.eth.abi.decodeLog(
				marketLogDecoder,
				log.data,
				[]
			);

			if (logMarket.name === 'Opensea: Seaport ⚓️') {
				const offer = decodedLogData.offer;
				const consideration = decodedLogData.consideration;
				const nftOnOfferSide = offer.some(
					(item) => item.token.toLowerCase() === contractAddress.toLowerCase()
				);
				const nftOnConsiderationSide = consideration.some(
					(item) => item.token.toLowerCase() === contractAddress.toLowerCase()
				);

				// Skip if the target token is not on both sides (offer & consideration)
				if (!nftOnOfferSide && !nftOnConsiderationSide) continue;

				// if target nft on offer side, then consideration is the total price
				// else offer is the total price
				if (nftOnOfferSide) {
					const totalConsiderationAmount = consideration.reduce(reducer, 0);
					totalPrice += totalConsiderationAmount;
					prices.push(formatPrice(totalConsiderationAmount));
				} else {
					const totalOfferAmount = offer.reduce(reducer, 0);
					totalPrice += totalOfferAmount;
					prices.push(formatPrice(totalOfferAmount));
				}
				marketList.push(logMarket);
			} else if (marketList.length + 1 === tokens.length) {
				const decodedPrice =
					logMarket.name === 'X2Y2 ⭕️'
						? decodedLogData.amount
						: decodedLogData.price;

				const price = Number(
					ethers.utils.formatUnits(decodedPrice, currency.decimals)
				);
				totalPrice += price;
				prices.push(formatPrice(price));
				marketList.push(logMarket);
			}
		}
	}

	const quantity = tokenType === 'ERC721' ? tokens.length : _.sum(tokens);

	if (quantity === 0) {
		console.error(
			'No tokens found. Please check the contract address is correct.'
		);
		return null;
	}
	const tokenData = await getTokenData(tokenId, contractAddress);
	const usdPrice = await getEthUsdPrice(totalPrice);

	return {
		market: market,
		tokens: tokens,
		tokenType: tokenType,
		quantity: quantity,
		marketList: marketList,
		prices: prices,
		totalPrice: totalPrice,
		currency: currency,
		usdPrice: usdPrice,
		fromAddr: fromAddr,
		toAddr: toAddr,
		tokenData: tokenData,
		isSweep: isSweep,
		sweeperAddr: receipt.from,
		transactionHash: transactionHash
	};
}

export { parseTransaction };
