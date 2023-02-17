import { ethers } from 'ethers';
import { markets, currencies } from '../config/markets.js';
import {
    parseBlur,
    parseLooksRare,
    parseSeaport,
    parseSudoswap,
    parseX2Y2,
    parseTransferEvent
} from './index.js';
import { initializeTransactionData } from '../config/initialize.js';
import { Logger, log } from '../Logger/index.js';
import {
    getNftMetadata,
    getEthUsdPrice,
    getReadableName,
    getTransactionReceipt
} from '../api/api.js';
import { createRequire } from 'module';

import type { Config, Options } from '../types/interfaces/enft.interface.js';
import type { TransactionData } from '../types/models/transaction.model.js';

const require = createRequire(import.meta.url);
const ABI = require('../abi/ABI.json');
const API_CALL_LIMIT = 10;

/**
 *
 * Parses the transaction with the specified hash and returns a
 * TransactionData object representing the transaction,
 * including NFT sales data.
 *
 * @async
 * @function
 * @param {string} transactionHash - The hash of the transaction to parse.
 * @param {Config} config - The configuration for the client.
 * @param {Options} options - The options for the client.
 * @throws {Error} Throw an error if no tokens are found in the transaction, or if the transaction hash or contract is invalid.
 * @returns {Promise<TransactionData | null>} A promise that resolves with the TransactionData object if the transaction was successfully parsed, otherwise null.
 */
async function parseTransaction(
    transactionHash: string,
    config: Config,
    options: Options
): Promise<TransactionData | null> {
    const receipt = await getTransactionReceipt(
        transactionHash,
        config.provider
    );
    const interactedAddress = receipt ? receipt.to?.toLowerCase() : '';

    if (!receipt || !interactedAddress || !(interactedAddress in markets)) {
        return null;
    }
    const tx = initializeTransactionData(
        transactionHash,
        interactedAddress,
        config.contractMetadata,
        config.contractAddress
    );
    const isSudoswap = tx.interactedMarket.name === 'sudoswap';
    const iface = new ethers.Interface(ABI);

    if (isSudoswap) {
        await parseSudoswap(tx, config.provider);
    }

    for (const log of receipt.logs) {
        const logAddress = log.address.toLowerCase();
        const market = markets[logAddress];

        if (logAddress in currencies) {
            tx.currency = currencies[logAddress as keyof typeof currencies];
        }

        if (
            market?.name === 'opensea' &&
            market?.topics.includes(log.topics[0])
        ) {
            parseSeaport(tx, log, market, iface);
        } else if (
            market?.name === 'looksrare' &&
            market?.topics.includes(log.topics[0])
        ) {
            parseLooksRare(tx, log, market, iface);
        } else if (
            market?.name === 'x2y2' &&
            market?.topics.includes(log.topics[0])
        ) {
            parseX2Y2(tx, log, market, iface);
        } else if (
            market?.name === 'blur' &&
            market?.topics.includes(log.topics[0])
        ) {
            parseBlur(tx, log, market, iface);
        } else if (isSudoswap) {
            parseTransferEvent(tx, log, logAddress, iface);
        }
    }

    if (
        (!tx.swap && tx.totalAmount === 0) ||
        (tx.swap && !tx.swap.maker.address)
    ) {
        throw log.throwError(
            'No tokens found. Please check the contract or transaction hash is correct.',
            Logger.code.INVALID_ARGUMENT,
            { location: Logger.location.PARSE_TRANSACTION }
        );
    }

    await setReadableName(tx, config, receipt.from);

    if (!tx.swap && !options.test) {
        await getNftsMetadata(tx, config);
    }

    if (
        !tx.swap &&
        options.etherscanApiKey &&
        (tx.currency.name === 'ETH' || tx.currency.name === 'WETH')
    ) {
        tx.usdPrice = await getEthUsdPrice(
            tx.totalPrice,
            options.etherscanApiKey
        );
    }

    return tx;
}

/**
 *
 * Fetches the metadata for each NFT in the specified transaction
 * and updates the corresponding token object with the metadata.
 *
 * @async
 * @function
 * @param {TransactionData} tx - The transaction to fetch NFT metadata from.
 * @param {Config} config - The configuration for the client.
 **/
const getNftsMetadata = async (tx: TransactionData, config: Config) => {
    let count = 0;

    for (const tokenId in tx.tokens) {
        const token = tx.tokens[tokenId];

        const tokenMetadata = await getNftMetadata(
            config.contractAddress,
            tokenId,
            config.apiAuth
        );
        count++;

        token.name = tokenMetadata.name || token.name;
        token.image = tokenMetadata.image;

        if (count >= API_CALL_LIMIT) {
            console.warn(
                `${API_CALL_LIMIT} API Call limit reached. Some tokens may not have image source.`
            );
            break;
        }
    }
};

/**
 *
 * Sets the readable name property of the transaction's relevant objects.
 *
 * @async
 * @function
 * @param {TransactionData} tx - The transaction to set the readable name property on.
 * @param {Config} config - The configuration for the client.
 * @param {string} from - The Ethereum from address associated with the transaction.
 **/
const setReadableName = async (
    tx: TransactionData,
    config: Config,
    from: string
) => {
    if (tx.swap?.maker.address && tx.swap?.taker.address) {
        tx.swap.maker.name = await getReadableName(
            tx.swap.maker.address,
            config.provider
        );
        tx.swap.taker.name = await getReadableName(
            tx.swap.taker.address,
            config.provider
        );
    } else if (tx.totalAmount > 1 || tx.isAggregator) {
        tx.toAddrName = await getReadableName(from, config.provider);
        tx.toAddr = from;
    } else if (tx.fromAddr && tx.toAddr) {
        tx.fromAddrName = await getReadableName(tx.fromAddr, config.provider);
        tx.toAddrName = await getReadableName(tx.toAddr, config.provider);
    }
};

export { parseTransaction };
