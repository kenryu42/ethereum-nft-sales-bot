import { ethers } from 'ethers';
import { setTokenData } from '../utils/helper.js';
import { Logger, log as LOG } from '../Logger/index.js';

import type { Log, Interface } from 'ethers';
import type { Market } from '../types/models/market.model.js';
import type { TransactionData } from '../types/models/transaction.model.js';

const SafeCollectionBidPolicyERC721 =
    '0x0000000000b92d5d043faf7cecf7e2ee6aaed232';
// const StandardPolicyERC721 = '0x0000000000dab4a563819e8fd93dba3b25bc3495';

/**
 *
 * Parses the transaction log for the Blur market and update
 * transaction data object with relevant information.
 *
 * @function
 * @param {TransactionData} tx - The transaction data object to be updated.
 * @param {Log} log - The log event object containing information about the transaction.
 * @param {Market} market - The market object containing market-specific data.
 * @param {Interface} iface - The interface object for the market contract.
 **/
const parseBlur = (
    tx: TransactionData,
    log: Log,
    market: Market,
    iface: Interface
) => {
    const decodedLogData = iface.parseLog({
        data: log.data,
        topics: [...log.topics]
    })?.args;

    if (!decodedLogData) {
        throw LOG.throwError('Failed to parse log data', Logger.code.ABI, {
            location: Logger.location.PARSE_BLUR
        });
    }

    const tokenId = decodedLogData.sell.tokenId.toString();
    const amount = Number(decodedLogData.sell.amount);
    const price = Number(ethers.formatUnits(decodedLogData.sell.price, 18));
    const collection = decodedLogData.sell.collection.toLowerCase();
    const matchingPolicy = decodedLogData.sell.matchingPolicy.toLowerCase();

    if (matchingPolicy === SafeCollectionBidPolicyERC721) {
        tx.isBlurBid = true;
    }

    if (collection !== tx.contractAddress) {
        return;
    }

    tx.fromAddr = decodedLogData.sell.trader;
    tx.toAddr = decodedLogData.buy.trader;
    tx.totalPrice += price;
    tx.totalAmount += amount;

    setTokenData({
        tokens: tx.tokens,
        tokenId: tokenId,
        price: price,
        amount: amount,
        market: market,
        currencyAddr: '0x0000000000000000000000000000000000000000'
    });
};

export { parseBlur };
