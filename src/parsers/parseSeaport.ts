import { ethers } from 'ethers';
import { formatPrice, setTokenData } from '../utils/helper.js';
import { markets, currencies } from '../config/markets.js';
import { Logger, log as LOG } from '../Logger/index.js';
import { parseNftTrader } from './parseNftTrader.js';

import type { Log, Interface } from 'ethers';
import type { Market } from '../types/models/market.model.js';
import type { TransactionData } from '../types/models/transaction.model.js';
import type {
    OfferItem,
    ConsiderationItem
} from '../types/contracts/seaport.contract.js';

/**
 *
 * Parses the transaction log that interacts with Seaport contract
 * and updates the TransactionData object.
 *
 * @function
 * @param {TransactionData} tx - The transaction data object.
 * @param {Log} log - The transaction log object to be parsed.
 * @param {Market} market - The market object.
 * @param {Interface} iface - The interface object for the market contract.
 **/
const parseSeaport = (
    tx: TransactionData,
    log: Log,
    market: Market,
    iface: Interface
) => {
    let price;
    const token_id = {
        value: ''
    };
    const abiCoder = iface.getAbiCoder();
    const nullAddress = '0x0000000000000000000000000000000000000000';
    const decodedLogData = iface.parseLog({
        data: log.data,
        topics: [...log.topics]
    })?.args;

    if (!decodedLogData) {
        throw LOG.throwError('Failed to parse log data', Logger.code.ABI, {
            location: Logger.location.PARSE_SEAPORT
        });
    }

    const offer: OfferItem[] = decodedLogData.offer;
    const consideration: ConsiderationItem[] = decodedLogData.consideration;
    const isNftTrader = consideration.some((item: ConsiderationItem) => {
        const market = markets[item.recipient.toLowerCase()];

        if (market?.name === 'nfttrader') {
            tx.interactedMarket = market;

            return true;
        }
    });

    if (isNftTrader) return parseNftTrader(tx, log, decodedLogData, abiCoder);

    const nftOnOfferSide = parse(offer, tx, market, token_id);
    const nftOnConsiderationSide = parse(consideration, tx, market, token_id);
    const token = tx.tokens[token_id.value];

    if (!nftOnOfferSide && !nftOnConsiderationSide) return;

    // if target nft on offer side, then consideration is the total price
    // else offer is the total price
    if (nftOnOfferSide) {
        const totalConsiderationAmount = consideration.reduce(
            getReducer(tx),
            0
        );

        price = totalConsiderationAmount;
        tx.fromAddr = abiCoder.decode(['address'], log.topics[1]).toString();
        if (decodedLogData.recipient !== nullAddress) {
            tx.toAddr = decodedLogData.recipient;
        }
    } else {
        const totalOfferAmount = offer.reduce(getReducer(tx), 0);

        price = totalOfferAmount;

        if (decodedLogData.recipient !== nullAddress) {
            tx.fromAddr = decodedLogData.recipient;
        }
        tx.toAddr = abiCoder.decode(['address'], log.topics[1]).toString();
    }

    if (token.markets) {
        const opensea = token.markets[market.name];

        // Fix double counting sales price when seaport
        // using matchAdvancedOrders function.
        if (opensea.amount === 2 && tx.contractData.tokenType === 'ERC721') {
            opensea.amount -= 1;
            tx.totalAmount -= 1;
        } else {
            opensea.price.value =
                opensea.price.value !== '~'
                    ? formatPrice(Number(opensea.price.value) + price)
                    : formatPrice(price);
            opensea.price.currency = tx.currency;
            tx.totalPrice += price;
        }
    }
};

/**
 *
 * Creates a reducer function for calculating the total value of
 * token amounts in a transaction data object.
 *
 * @function
 * @param {TransactionData} tx - The transaction data object containing token amounts and their corresponding token symbols.
 * @returns {function(previous: number, current: OfferItem | ConsiderationItem): number}
 * A reducer function that takes in a previous total value and a current token item,
 * and returns the updated total value.
 **/
function getReducer(
    tx: TransactionData
): (previous: number, current: OfferItem | ConsiderationItem) => number {
    return (previous: number, current: OfferItem | ConsiderationItem) => {
        const currency =
            currencies[current.token.toLowerCase() as keyof typeof currencies];
        if (currency !== undefined) {
            tx.currency = currency;
            const result =
                previous +
                Number(ethers.formatUnits(current.amount, currency.decimals));

            return result;
        } else {
            return previous;
        }
    };
}

/**
 *
 * Parses an array of token items and updates a transaction data
 * object and a token ID object with relevant information.
 *
 * @function
 * @param {OfferItem[] | ConsiderationItem[]} items - An array of token items to be parsed.
 * @param {TransactionData} tx - The transaction data object to be updated with total amount and token data.
 * @param {Market} market - The market object containing market-specific data.
 * @param {{ value: string }} token_id - The token ID object to be updated with the parsed token ID.
 * @returns {boolean} - A boolean value indicating whether at least one item in the array corresponds to an NFT owned by the user.
 **/
const parse = (
    items: OfferItem[] | ConsiderationItem[],
    tx: TransactionData,
    market: Market,
    token_id: { value: string }
): boolean => {
    let isNft = false;

    for (const item of items) {
        if (item.token.toLowerCase() === tx.contractAddress) {
            const tokenId = item.identifier;
            const amount = Number(item.amount);

            token_id.value = tokenId;
            tx.totalAmount += amount;

            setTokenData({
                tokens: tx.tokens,
                tokenId: tokenId,
                amount: amount,
                market: market
            });

            isNft = true;
        }
    }

    return isNft;
};

export { parseSeaport };
