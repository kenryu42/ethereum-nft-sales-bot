import { ethers } from 'ethers';
import { currencies } from '../config/currencies.js';
import { kodexMarket } from '../config/markets.js';
import type { Market, TransactionData, SeaportOrder, OfferItem, ConsiderationItem } from '../types';
import { formatPrice } from '../utils/api.js';

const parseKodexSeaport = (tx: TransactionData, _: Market, decodedLogData: SeaportOrder) => {
    const offer = decodedLogData.offer;
    const consideration = decodedLogData.consideration;
    const nftOnOfferSide = offer.some((item) => item.token.toLowerCase() === tx.contractAddress);
    const nftOnConsiderationSide = consideration.some(
        (item) => item.token.toLowerCase() === tx.contractAddress
    );
    let price;

    // Skip if the target token is not on both sides (offer & consideration)
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
    tx.recipient = kodexMarket.name;
    tx.market = kodexMarket;
    tx.marketList.push(kodexMarket);
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

export { parseKodexSeaport };
