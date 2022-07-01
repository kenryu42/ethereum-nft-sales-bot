import { ethers } from 'ethers';
import 'dotenv/config';
import axios from 'axios';
import _ from 'lodash';
import retry from 'async-retry';

import {
	OPENSEA_API_KEY,
	ALCHEMY_API_KEY,
	CONTRACT_ADDRESS,
	ETHERSCAN_API_KEY
} from '../config/setup.js';

const openseaNftApi = async (tokenId, contractAddress = CONTRACT_ADDRESS) => {
	const baseURL = `https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenId}`;

	try {
		const response = await axios.get(baseURL, {
			headers: {
				'X-API-KEY': OPENSEA_API_KEY
			}
		});

		return response;
	} catch (error) {
		if (error.response) {
			console.log(error.response.data);
			console.log(error.response.status);
		} else {
			console.error(error.message);
		}

		return null;
	}
};

const retryOnOpenseaNftApi = async (
	tokenId,
	contractAddress = CONTRACT_ADDRESS
) => {
	const result = await retry(
		async () => {
			const res = await openseaNftApi(tokenId, contractAddress);

			if (res === null) {
				throw new Error('Might hitting rate limit, try again');
			}

			const data = _.get(res, 'data');

			return {
				status: _.get(res, 'status'),
				name: _.get(data, 'name'),
				image: _.get(data, 'image_url'),
				collectionName: _.get(data, ['collection', 'name'])
			};
		},
		{
			retries: 5
		}
	);

	return result;
};

const getOpenseaName = async (address) => {
	try {
		const response = await axios.get(
			`https://api.opensea.io/api/v1/account/${address}`
		);

		const result = _.get(response, 'data');

		return _.get(result, ['data', 'user', 'username']);
	} catch (error) {
		if (error.response) {
			console.log('Error message:', error.response.data);
			console.log('Status:', error.response.status);
		} else {
			console.error(error.message);
		}
	}
};

const getContractData = async (contractAddress = CONTRACT_ADDRESS) => {
	try {
		const response = await axios.get(
			`https://api.opensea.io/api/v1/asset_contract/${contractAddress}`,
			{
				headers: {
					'X-API-KEY': OPENSEA_API_KEY
				}
			}
		);

		const result = _.get(response, 'data');

		return result;
	} catch (error) {
		console.log(
			'Please make sure you enter a valid CONTRACT_ADDRESS at (file:./.env)'
		);
		if (error.response) {
			console.log('Error data:', error.response.data);
			console.log('Status:', error.response.status);
		} else {
			console.error('Error message:', error.message);
		}
		process.exit();
	}
};

const getENSName = async (address) => {
	try {
		// const provider = new ethers.providers.CloudflareProvider();
		const provider = new ethers.providers.AlchemyProvider(
			'homestead',
			ALCHEMY_API_KEY
		);
		const result = await provider.lookupAddress(address);

		return result;
	} catch (error) {
		console.log('API error: ', error);
	}
};

const getReadableName = async (address) => {
	const result =
		(await getOpenseaName(address)) ||
		(await getENSName(address)) ||
		shortenAddress(address);

	return result;
};

const getTransactionReceipt = async (web3, transactionHash) => {
	const receipt = await retry(
		async () => {
			const rec = await web3.eth.getTransactionReceipt(transactionHash);

			if (rec == null) {
				throw new Error('receipt not found, try again');
			}

			return rec;
		},
		{
			retries: 3
		}
	);

	return receipt;
};

const getTokenData = async (tokenId, contractAddress = CONTRACT_ADDRESS) => {
	try {
		const osApi = await retryOnOpenseaNftApi(tokenId, contractAddress);

		return osApi;
	} catch (error) {
		console.log('API error: ', error);
	}
};

const shortenAddress = (address) => {
	if (!ethers.utils.isAddress(address)) {
		throw new Error('Not a valid address');
	}
	return (
		address.substring(0, 6) + '...' + address.substring(address.length - 4)
	);
};

const getEthUsdPrice = async (ethPrice) => {
	const url = `
https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${ETHERSCAN_API_KEY}
`;
	const result = await retry(
		async () => {
			const response = await axios.get(url);
			const result = _.get(response, ['data', 'result']);
			const ethusd = _.get(result, 'ethusd');
			const usdPrice = (ethPrice * ethusd).toFixed(2);

			return parseFloat(usdPrice).toLocaleString('en-US');
		},
		{
			retries: 5
		}
	);

	return result;
};

const formatPrice = (price) => {
	let formatedPrice = price.toFixed(3);
	const lastChar = formatedPrice.length - 1;

	formatedPrice =
		formatedPrice[lastChar] === '0'
			? formatedPrice.slice(0, -1)
			: formatedPrice;
	return formatedPrice;
};

export {
	getENSName,
	formatPrice,
	getTokenData,
	shortenAddress,
	getEthUsdPrice,
	getOpenseaName,
	getContractData,
	getReadableName,
	getTransactionReceipt
};
