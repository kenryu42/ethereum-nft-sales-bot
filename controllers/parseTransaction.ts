import {
    formatPrice,
    getTokenData,
    getReadableName,
    getTransactionReceipt,
    getEthUsdPrice
} from '../utils/api';
import _ from 'lodash';
import { ethers } from 'ethers';
import { markets } from '../config/markets';
import { parseSeaport } from './parseSeaport';
import { parseNftTrader } from './parseNftTrader';
import { parseSaleToken } from './parseSaleToken';
import { parseSwapToken } from './parseSwapToken';
import { currencies } from '../config/currencies';
import { saleEventTypes } from '../config/logEventTypes';
import { AlchemyWeb3 } from '@alch/alchemy-web3';
import { ContractData, TransactionData } from '../types/types';

async function parseTransaction(
    web3: AlchemyWeb3,
    transactionHash: string,
    contractAddress: string,
    contractData: ContractData
) {
    const receipt = await getTransactionReceipt(web3, transactionHash);
    const recipient = receipt.to.toLowerCase();

    if (!(recipient in markets)) {
        return null;
    }

    const tx: TransactionData = {
        swap: {},
        prices: [],
        totalPrice: 0,
        tokens: [],
        symbol: contractData.symbol,
        tokenType: contractData.tokenType,
        contractName: contractData.name,
        marketList: [],
        market: _.get(markets, recipient),
        currency: { name: 'ETH', decimals: 18 },
        contractAddress: contractAddress
    };
    tx.isSwap = tx.market.name === 'NFT Trader 🔄';
    tx.isSweep = tx.market.name === 'Gem 💎' || tx.market.name === 'Genie 🧞‍♂️';

    for (const log of receipt.logs) {
        const logAddress = log.address.toLowerCase();
        const logMarket = _.get(markets, logAddress);

        if (logAddress in currencies && !tx.isSweep) {
            tx.currency = currencies[logAddress as keyof typeof currencies];
        }

        if (tx.isSwap) {
            parseSwapToken(tx, web3, log, logAddress);
        } else {
            parseSaleToken(tx, web3, log, logAddress);
        }

        const isSale = logAddress === recipient && saleEventTypes.includes(log.topics[0]);
        const isAggregatorSale = logAddress in markets && saleEventTypes.includes(log.topics[0]);

        if (isSale || isAggregatorSale) {
            const marketLogDecoder = isSale
                ? tx.market.logDecoder
                : markets[logAddress as keyof typeof markets].logDecoder;
            const decodedLogData: any = web3.eth.abi.decodeLog(marketLogDecoder, log.data, []);

            if (logMarket.name === 'Opensea: Seaport ⚓️') {
                const parseResult = parseSeaport(tx, logMarket, decodedLogData);

                if (parseResult === null) continue;
            } else if (logMarket.name === 'NFT Trader 🔄') {
                const parseResult = await parseNftTrader(tx, web3, log, logAddress, decodedLogData);

                if (parseResult === null) return null;
            } else if (tx.marketList.length + 1 === tx.tokens.length) {
                const decodedPrice =
                    logMarket.name === 'X2Y2 ⭕️' ? decodedLogData.amount : decodedLogData.price;
                const price = Number(ethers.utils.formatUnits(decodedPrice, tx.currency.decimals));

                tx.totalPrice += price;
                tx.marketList.push(logMarket);
                tx.prices.push(formatPrice(price));
            }
        }
    }

    tx.quantity = tx.tokenType === 'ERC721' ? tx.tokens.length : _.sum(tx.tokens);

    if ((!tx.isSwap && tx.quantity === 0) || (tx.isSwap && !tx.swap.monitorTokenId)) {
        console.error('No tokens found. Please check the contract address is correct.');
        return null;
    }
    tx.to = !tx.isSwap ? await getReadableName(tx.toAddr!) : '';
    tx.from = !tx.isSwap ? await getReadableName(tx.fromAddr!) : '';
    tx.tokenData = tx.swap.monitorTokenId
        ? await getTokenData(contractAddress, tx.tokenType!, tx.swap.monitorTokenId)
        : await getTokenData(contractAddress, tx.tokenType!, tx.tokenId!);
    tx.tokenName = tx.tokenData.name || `${tx.symbol} #${tx.tokenId}`;
    tx.sweeperAddr = receipt.from;
    tx.sweeper = tx.isSweep ? await getReadableName(tx.sweeperAddr) : '';
    tx.usdPrice =
        !tx.isSwap && (tx.currency.name === 'ETH' || tx.currency.name === 'WETH')
            ? await getEthUsdPrice(tx.totalPrice)
            : null;
    tx.ethUsdValue = tx.usdPrice ? `($ ${tx.usdPrice})` : '';
    tx.transactionHash = transactionHash;

    return tx;
}

export { parseTransaction };
