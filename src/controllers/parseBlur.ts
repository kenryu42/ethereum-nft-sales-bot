import { ethers } from 'ethers';
import type { Market, TransactionData, BlurOrder } from '../types';
import { formatPrice } from '../utils/api.js';

const parseBlur = (tx: TransactionData, logMarket: Market, decodedLogData: BlurOrder) => {
    // const price = decodedLogData.sell.amount;
    const price = Number(ethers.utils.formatUnits(decodedLogData.sell.price, 18));

    tx.totalPrice += price;
    tx.marketList.push(logMarket);
    tx.prices.push(formatPrice(price));

    return [price, false];
};

export { parseBlur };
