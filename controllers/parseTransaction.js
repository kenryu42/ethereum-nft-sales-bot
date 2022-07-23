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

async function parseTransaction(web3, transactionHash, contractAddress, tokenType) {
    const receipt = await getTransactionReceipt(web3, transactionHash);
    const recipient = receipt.to.toLowerCase();

    if (!(recipient in markets)) {
        return null;
    }

    const swap = {};
    const prices = [];
    const marketList = [];
    const market = _.get(markets, recipient);
    const isSwap = market.name === 'NFT Trader 🔄';
    const isSweep = market.name === 'Gem.XYZ 💎' || market.name === 'Genie 🧞‍♂️';
    let toAddr;
    let tokenId;
    let fromAddr;
    let tokens = [];
    let addressMaker;
    let addressTaker;
    let totalPrice = 0;
    let currency = {
        name: 'ETH',
        decimals: 18
    };

    for (const log of receipt.logs) {
        const logAddress = log.address.toLowerCase();
        const logMarket = _.get(markets, logAddress);

        if (logAddress in currencies && !isSweep) {
            currency = currencies[logAddress];
        }

        if (isSwap) {
            tokenId = parseSwapToken({
                web3,
                log,
                logAddress,
                isSwap,
                swap,
                tokenId,
                contractAddress
            });
        } else {
            ({ tokens, tokenId, fromAddr, toAddr } = parseSaleToken({
                web3,
                log,
                logAddress,
                tokenType,
                tokens,
                tokenId,
                fromAddr,
                toAddr,
                contractAddress
            }));
        }

        const isSale = logAddress === recipient && saleEventTypes.includes(log.topics[0]);
        const isAggregatorSale = logAddress in markets && saleEventTypes.includes(log.topics[0]);

        if (isSale || isAggregatorSale) {
            const marketLogDecoder = isSale ? market.logDecoder : markets[logAddress].logDecoder;
            const decodedLogData = web3.eth.abi.decodeLog(marketLogDecoder, log.data, []);

            if (logMarket.name === 'Opensea: Seaport ⚓️') {
                const [price, skip] = parseSeaport({
                    decodedLogData,
                    contractAddress
                });
                if (skip) continue;
                totalPrice += price;
                marketList.push(logMarket);
                prices.push(formatPrice(price));
            } else if (logMarket.name === 'NFT Trader 🔄') {
                [addressMaker, addressTaker] = await parseNftTrader({
                    web3,
                    log,
                    swap,
                    logAddress,
                    decodedLogData
                });
                if (!addressMaker && !addressTaker) return null;
            } else if (marketList.length + 1 === tokens.length) {
                const decodedPrice =
                    logMarket.name === 'X2Y2 ⭕️' ? decodedLogData.amount : decodedLogData.price;

                const price = Number(ethers.utils.formatUnits(decodedPrice, currency.decimals));
                totalPrice += price;
                marketList.push(logMarket);
                prices.push(formatPrice(price));
            }
        }
    }

    const quantity = tokenType === 'ERC721' ? tokens.length : _.sum(tokens);

    if ((!isSwap && quantity === 0) || (isSwap && !swap.monitorTokenId)) {
        console.error('No tokens found. Please check the contract address is correct.');
        return null;
    }
    const to = !isSwap ? await getReadableName(toAddr) : null;
    const from = !isSwap ? await getReadableName(fromAddr) : null;
    const tokenData = swap.monitorTokenId
        ? await getTokenData(swap.monitorTokenId, contractAddress)
        : await getTokenData(tokenId, contractAddress);
    const tokenName = tokenData.name || `${tokenData.symbol} #${tokenId}`;
    const sweeper = isSweep ? await getReadableName(receipt.from) : null;
    const usdPrice =
        !isSwap && (currency.name === 'ETH' || currency.name === 'WETH')
            ? await getEthUsdPrice(totalPrice)
            : null;
    const ethUsdValue = usdPrice ? `($ ${usdPrice})` : '';

    return {
        market: market,
        tokens: tokens,
        tokenId: tokenId,
        tokenName: tokenName,
        tokenType: tokenType,
        quantity: quantity,
        marketList: marketList,
        prices: prices,
        totalPrice: totalPrice,
        currency: currency,
        usdPrice: usdPrice,
        ethUsdValue: ethUsdValue,
        fromAddr: fromAddr,
        toAddr: toAddr,
        from: from,
        to: to,
        tokenData: tokenData,
        isSweep: isSweep,
        isSwap: isSwap,
        swap: swap,
        addressMaker: addressMaker,
        addressTaker: addressTaker,
        sweeperAddr: receipt.from,
        sweeper: sweeper,
        transactionHash: transactionHash
    };
}

export { parseTransaction };
