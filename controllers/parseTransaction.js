import {
    formatPrice,
    getTokenData,
    getReadableName,
    getTransactionReceipt,
    getEthUsdPrice
} from '../utils/api.js';
import _ from 'lodash';
import { ethers } from 'ethers';
import { markets } from '../config/markets.js';
import { parseSeaport } from './parseSeaport.js';
import { parseNftTrader } from './parseNftTrader.js';
import { parseSaleToken } from './parseSaleToken.js';
import { parseSwapToken } from './parseSwapToken.js';
import { currencies } from '../config/currencies.js';
import { saleEventTypes } from '../config/logEventTypes.js';

async function parseTransaction(web3, transactionHash, contractAddress, contractData) {
    const receipt = await getTransactionReceipt(web3, transactionHash);
    const recipient = receipt.to.toLowerCase();

    if (!(recipient in markets)) {
        return null;
    }

    const tx = {
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
            tx.currency = currencies[logAddress];
        }

        if (tx.isSwap) {
            parseSwapToken({ tx, web3, log, logAddress });
        } else {
            parseSaleToken({ tx, web3, log, logAddress });
        }

        const isSale = logAddress === recipient && saleEventTypes.includes(log.topics[0]);
        const isAggregatorSale = logAddress in markets && saleEventTypes.includes(log.topics[0]);

        if (isSale || isAggregatorSale) {
            const marketLogDecoder = isSale ? tx.market.logDecoder : markets[logAddress].logDecoder;
            const decodedLogData = web3.eth.abi.decodeLog(marketLogDecoder, log.data, []);

            if (logMarket.name === 'Opensea: Seaport ⚓️') {
                const parseResult = parseSeaport({ tx, logMarket, decodedLogData });

                if (parseResult === null) continue;
            } else if (logMarket.name === 'NFT Trader 🔄') {
                const parseResult = await parseNftTrader({
                    tx,
                    web3,
                    log,
                    logAddress,
                    decodedLogData
                });

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
    tx.to = !tx.isSwap ? await getReadableName(tx.toAddr) : null;
    tx.from = !tx.isSwap ? await getReadableName(tx.fromAddr) : null;
    tx.tokenData = tx.swap.monitorTokenId
        ? await getTokenData(contractAddress, tx.tokenType, tx.swap.monitorTokenId)
        : await getTokenData(contractAddress, tx.tokenType, tx.tokenId);
    tx.tokenName = tx.tokenData.name || `${tx.symbol} #${tx.tokenId}`;
    tx.sweeperAddr = receipt.from;
    tx.sweeper = tx.isSweep ? await getReadableName(tx.sweeperAddr) : null;
    tx.usdPrice =
        !tx.isSwap && (tx.currency.name === 'ETH' || tx.currency.name === 'WETH')
            ? await getEthUsdPrice(tx.totalPrice)
            : null;
    tx.ethUsdValue = tx.usdPrice ? `($ ${tx.usdPrice})` : '';
    tx.transactionHash = transactionHash;

    return tx;
}

export { parseTransaction };
