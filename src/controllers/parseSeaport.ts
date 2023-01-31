import Web3EthAbi from 'web3-eth-abi';
import { ethers } from 'ethers';
import { currencies } from '../config/currencies.js';
import { formatPrice } from '../utils/api.js';
import { ItemType } from '../types/types.js';
import { NftTokenType } from 'alchemy-sdk';
import { markets } from '../config/markets.js';

import type { Log } from '@ethersproject/abstract-provider';
import type { Market, TransactionData, SeaportOrder, OfferItem, ConsiderationItem } from '../types';

const parseSeaport = (
    tx: TransactionData,
    log: Log,
    logMarket: Market,
    decodedLogData: SeaportOrder
) => {
    const offer = decodedLogData.offer;
    const consideration = decodedLogData.consideration;
    const nftOnOfferSide = offer.some((item) => checkDuplicatedIdentifier(item, tx));
    const nftOnConsiderationSide = consideration.some((item) =>
        checkDuplicatedIdentifier(item, tx)
    );
    const isNftTrader = consideration.some((item) => {
        if (markets[item.recipient.toLowerCase()]?.name === 'nft-trader') {
            tx.market = markets[item.recipient.toLowerCase()];

            return true;
        }
    });
    let price;

    if (!nftOnOfferSide && !nftOnConsiderationSide) return false;
    if (isNftTrader) {
        let makerSpentAmount = 0;
        let takerSpentAmount = 0;

        tx.isNftTrader = true;
        tx.swap.maker.address = String(Web3EthAbi.decodeParameter('address', log.topics[1]));
        tx.swap.taker.address = decodedLogData.recipient;

        offer.forEach((item) => {
            if (item.itemType == ItemType.NATIVE || item.itemType == ItemType.ERC20) {
                const currency = currencies[item.token.toLowerCase() as keyof typeof currencies];

                makerSpentAmount += Number(
                    ethers.utils.formatUnits(item.amount, currency.decimals)
                );
            } else if (item.itemType == ItemType.ERC721 || item.itemType == ItemType.ERC1155) {
                tx.swap.maker.spentAssets.push({
                    tokenId: item.identifier,
                    tokenType:
                        item.itemType == ItemType.ERC721
                            ? NftTokenType.ERC721
                            : NftTokenType.ERC1155,
                    contractAddress: item.token
                });
            }
        });
        tx.swap.maker.spentAmount = formatPrice(makerSpentAmount);

        consideration.forEach((item) => {
            if (item.itemType == ItemType.NATIVE || item.itemType == ItemType.ERC20) {
                const currency = currencies[item.token.toLowerCase() as keyof typeof currencies];

                takerSpentAmount += Number(
                    ethers.utils.formatUnits(item.amount, currency.decimals)
                );
            } else if (item.itemType == ItemType.ERC721 || item.itemType == ItemType.ERC1155) {
                tx.swap.taker.spentAssets.push({
                    tokenId: item.identifier,
                    tokenType:
                        item.itemType == ItemType.ERC721
                            ? NftTokenType.ERC721
                            : NftTokenType.ERC1155,
                    contractAddress: item.token
                });
            }
        });
        tx.swap.taker.spentAmount = formatPrice(takerSpentAmount);
    } else {
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
    }

    return true;
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
