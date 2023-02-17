import { ethers } from 'ethers';
import { setTokenData } from '../utils/helper.js';
import { currencies } from '../config/markets.js';
import { Logger, log as LOG } from '../Logger/index.js';

import type { Log, Interface } from 'ethers';
import type { TransactionData } from '../types/models/transaction.model.js';
import type { Market, CurrencyAddress } from '../types/models/market.model.js';

/**
 *
 * Parse transaction logs for the x2y2 market and
 * update transaction data with relevant information.
 *
 * @function
 * @param {TransactionData} tx - The transaction data object to be updated.
 * @param {Log} log - The transaction log to be parsed.
 * @param {Market} market - The x2y2 market data.
 * @param {Interface} iface - The interface object containing the ABI for the market.
 **/
const parseX2Y2 = (
    tx: TransactionData,
    log: Log,
    market: Market,
    iface: Interface
) => {
    const abiCoder = iface.getAbiCoder();
    const decodedLogData = iface.parseLog({
        data: log.data,
        topics: [...log.topics]
    })?.args;

    if (!decodedLogData) {
        throw LOG.throwError('Failed to parse log data', Logger.code.ABI, {
            location: Logger.location.PARSE_X2Y2
        });
    }

    const intent = decodedLogData.intent.toString();
    const currencyAddr = decodedLogData.currency as CurrencyAddress;
    const currency = currencies[currencyAddr as keyof typeof currencies];
    const price = Number(
        ethers.formatUnits(decodedLogData.item.price, currency.decimals)
    );
    const decodedData = abiCoder.decode(
        ['uint256', 'uint256', 'address', 'uint256'],
        decodedLogData.item.data
    );

    const [, amount, contract, tokenId] = decodedData;

    if (contract.toLowerCase() !== tx.contractAddress) {
        return;
    }

    // INTENT_SELL
    if (intent === '1') {
        tx.fromAddr = decodedLogData.maker;
        tx.toAddr = decodedLogData.taker;
        // INTENT_BUY
    } else if (intent === '3') {
        tx.fromAddr = decodedLogData.taker;
        tx.toAddr = decodedLogData.maker;
    }

    tx.totalPrice += price;
    tx.totalAmount += Number(amount);

    setTokenData({
        tokenData: tx.tokens,
        tokenId: tokenId.toString(),
        price: price,
        amount: Number(amount),
        market: market,
        currencyAddr: currencyAddr
    });
};

export { parseX2Y2 };
