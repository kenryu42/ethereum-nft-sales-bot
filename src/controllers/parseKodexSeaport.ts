import { kodexMarket, markets } from '../config/markets.js';
import type { Market, SeaportOrder, TransactionData } from '../types';
import { formatPrice } from '../utils/api.js';
import { seaportOfferOrConsiderationReducer } from './parseSeaport.js';

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
        const totalConsiderationAmount = consideration.reduce(
            seaportOfferOrConsiderationReducer,
            0
        );
        price = totalConsiderationAmount;
    } else {
        const totalOfferAmount = offer.reduce(seaportOfferOrConsiderationReducer, 0);
        price = totalOfferAmount;
    }
    tx.totalPrice += price;

    tx.recipient =
        tx.recipient === markets['0x00000000006c3852cbef3e08e8df289169ede581'].name
            ? kodexMarket.name
            : tx.recipient;
    tx.market =
        tx.market.name === markets['0x00000000006c3852cbef3e08e8df289169ede581'].name
            ? kodexMarket
            : tx.market;

    tx.marketList.push(kodexMarket);
    tx.prices.push(formatPrice(price));

    return [price, false];
};

export { parseKodexSeaport };
