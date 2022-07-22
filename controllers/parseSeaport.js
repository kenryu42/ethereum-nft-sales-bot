import { ethers } from 'ethers';
import { currencies } from '../config/currencies.js';

const parseSeaport = ({ decodedLogData, contractAddress }) => {
    const offer = decodedLogData.offer;
    const consideration = decodedLogData.consideration;
    const nftOnOfferSide = offer.some((item) => item.token.toLowerCase() === contractAddress);
    const nftOnConsiderationSide = consideration.some(
        (item) => item.token.toLowerCase() === contractAddress
    );
    let price;

    // Skip if the target token is not on both sides (offer & consideration)
    if (!nftOnOfferSide && !nftOnConsiderationSide) return [0, true];

    // if target nft on offer side, then consideration is the total price
    // else offer is the total price
    if (nftOnOfferSide) {
        const totalConsiderationAmount = consideration.reduce(reducer, 0);
        price = totalConsiderationAmount;
    } else {
        const totalOfferAmount = offer.reduce(reducer, 0);
        price = totalOfferAmount;
    }

    return [price, false];
};

function reducer(previous, current) {
    const currency = currencies[current.token.toLowerCase()];
    if (currency !== undefined) {
        const result =
            previous + Number(ethers.utils.formatUnits(current.amount, currency.decimals));

        return result;
    } else {
        return previous;
    }
}

export { parseSeaport };
