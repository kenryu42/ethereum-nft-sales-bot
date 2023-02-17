import { ethers } from 'ethers';
import { setTokenData } from '../utils/helper.js';
import { currencies } from '../config/markets.js';
import { Logger, log as LOG } from '../Logger/index.js';

import type { Log, Interface } from 'ethers';
import type { Market } from '../types/models/market.model.js';
import type { TransactionData } from '../types/models/transaction.model.js';

/**
 *
 * Parses the transaction log for the looksrare market and
 * update transaction data with relevant information.
 *
 * @function
 * @param {TransactionData} tx - The transaction data object to be updated with total amount and token data.
 * @param {Log} log - The log event object containing information about the transaction.
 * @param {Market} market - The market object containing market-specific data.
 * @param {Interface} iface - The interface object containing the ABI for the market.
 **/
const parseLooksRare = (
    tx: TransactionData,
    log: Log,
    market: Market,
    iface: Interface
) => {
    const eventTypes = {
        '0x95fb6205e23ff6bda16a2d1dba56b9ad7c783f67c96fa149785052f47696f2be':
            'takerBid',
        '0x68cd251d4d267c6e2034ff0088b990352b97b2002c0476587d0c4da889c11330':
            'takerAsk'
    };
    const abiCoder = iface.getAbiCoder();
    const eventType = eventTypes[log.topics[0] as keyof typeof eventTypes];
    const decodedLogData = iface.parseLog({
        data: log.data,
        topics: [...log.topics]
    })?.args;

    if (!decodedLogData) {
        throw LOG.throwError('Failed to parse log data', Logger.code.ABI, {
            location: Logger.location.PARSE_LOOKSRARE
        });
    }

    if (decodedLogData.collection.toLowerCase() !== tx.contractAddress) {
        return;
    }
    const currencyAddr =
        decodedLogData.currency.toLowerCase() as keyof typeof currencies;
    const price = Number(
        ethers.formatUnits(
            decodedLogData.price,
            currencies[currencyAddr].decimals
        )
    );
    const tokenId = decodedLogData.tokenId;
    const amount = parseInt(decodedLogData.amount);
    const [from, to] = eventType === 'takerBid' ? [2, 1] : [1, 2];

    tx.fromAddr = abiCoder.decode(['address'], log.topics[from]).toString();
    tx.toAddr = abiCoder.decode(['address'], log.topics[to]).toString();

    tx.totalPrice += price;
    tx.totalAmount += parseInt(decodedLogData.amount);

    setTokenData({
        tokenData: tx.tokens,
        tokenId: tokenId,
        price: price,
        amount: amount,
        market: market,
        currencyAddr: currencyAddr
    });
};

export { parseLooksRare };
