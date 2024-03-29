import { ethers } from 'ethers';
import { formatPrice } from '../utils/helper.js';
import { currencies } from '../config/markets.js';

import type {
    OfferItem,
    ConsiderationItem
} from '../types/contracts/seaport.contract.js';
import type { Log, AbiCoder, Result } from 'ethers';
import { ItemType } from '../types/enums/seaport.enum.js';
import type { TransactionData } from '../types/models/transaction.model.js';

/**
 *
 * Parses NFT trader transaction data to extract swap details
 * and populate the transaction object.
 *
 * @function
 * @param {TransactionData} tx - The transaction data object.
 * @param {Log} log - The log object containing the event data.
 * @param {Result} decodedLogData - The decoded log data of the event.
 * @param {AbiCoder} abiCoder - The AbiCoder object to decode contract data.
 **/
const parseNftTrader = (
    tx: TransactionData,
    log: Log,
    decodedLogData: Result,
    abiCoder: AbiCoder
) => {
    let makerSpentAmount = 0;
    let takerSpentAmount = 0;
    const offer = decodedLogData.offer;
    const consideration = decodedLogData.consideration;

    tx.swap = {
        taker: {
            spentAssets: []
        },
        maker: {
            spentAssets: []
        }
    };

    tx.swap.maker.address = abiCoder
        .decode(['address'], log.topics[1])
        .toString();
    tx.swap.taker.address = decodedLogData.recipient;

    offer.forEach((item: OfferItem) => {
        if (
            item.itemType == ItemType.NATIVE ||
            item.itemType == ItemType.ERC20
        ) {
            const currency =
                currencies[item.token.toLowerCase() as keyof typeof currencies];

            makerSpentAmount += Number(
                ethers.formatUnits(item.amount, currency.decimals)
            );
        } else if (
            item.itemType == ItemType.ERC721 ||
            item.itemType == ItemType.ERC1155
        ) {
            tx.swap?.maker.spentAssets.push({
                tokenId: item.identifier.toString(),
                tokenType:
                    item.itemType == ItemType.ERC721 ? 'ERC721' : 'ERC1155',
                contractAddress: item.token,
                amount: Number(item.amount)
            });
        }
    });
    tx.swap.maker.spentAmount = formatPrice(makerSpentAmount);

    consideration.forEach((item: ConsiderationItem) => {
        if (
            item.itemType == ItemType.NATIVE ||
            item.itemType == ItemType.ERC20
        ) {
            const currency =
                currencies[item.token.toLowerCase() as keyof typeof currencies];

            takerSpentAmount += Number(
                ethers.formatUnits(item.amount, currency.decimals)
            );
        } else if (
            item.itemType == ItemType.ERC721 ||
            item.itemType == ItemType.ERC1155
        ) {
            tx.swap?.taker.spentAssets.push({
                tokenId: item.identifier.toString(),
                tokenType:
                    item.itemType == ItemType.ERC721 ? 'ERC721' : 'ERC1155',
                contractAddress: item.token,
                amount: Number(item.amount)
            });
        }
    });
    tx.swap.taker.spentAmount = formatPrice(takerSpentAmount);
};

export { parseNftTrader };
