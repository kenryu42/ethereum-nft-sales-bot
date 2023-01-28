import { ethers } from 'ethers';
import { currencies } from '../config/currencies.js';
import type { Market, TransactionData, SeaportOrder, OfferItem, ConsiderationItem } from '../types';
import { formatPrice } from '../utils/api.js';

const parseSeaport = (tx: TransactionData, logMarket: Market, decodedLogData: SeaportOrder) => {
    const offer = decodedLogData.offer;
    const consideration = decodedLogData.consideration;
    const nftOnOfferSide = offer.some((item) => checkDuplicatedIdentifier(item, tx));
    const nftOnConsiderationSide = consideration.some((item) =>
        checkDuplicatedIdentifier(item, tx)
    );
    let price;

    if (!nftOnOfferSide && !nftOnConsiderationSide) return null;

    // if target nft on offer side, then consideration is the total price
    // else offer is the total price
    if (nftOnOfferSide) {
        const totalConsiderationAmount = consideration.reduce(reducer, 0);
        price = totalConsiderationAmount;
    } else {
        const totalOfferAmount = offer.reduce(reducer, 0);
        price = totalOfferAmount;
    }
    tx.totalPrice += price;
    tx.marketList.push(logMarket);
    tx.prices.push(formatPrice(price));

    return [price, false];
};

function reducer(previous: number, current: OfferItem | ConsiderationItem) {
    const currency = currencies[current.token.toLowerCase() as keyof typeof currencies];
    if (currency !== undefined) {
        const result =
            previous + Number(ethers.utils.formatUnits(current.amount, currency.decimals));

        return result;
    } else {
        return previous;
    }
}

// Fix double counting sales price when seaport using matchAdvancedOrders function
// Might need to improve this temporary solution in the future
const checkDuplicatedIdentifier = (item: OfferItem | ConsiderationItem, tx: TransactionData) => {
    if (item.token.toLowerCase() === tx.contractAddress) {
        const uniqueIdentifier = item.token.toLowerCase() + item.identifier;
        if (tx.seaportIdentifiers.includes(uniqueIdentifier)) {
            return false;
        } else {
            tx.seaportIdentifiers.push(uniqueIdentifier);
            return true;
        }
    }
};

export { parseSeaport };
