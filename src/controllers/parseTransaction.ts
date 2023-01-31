import { formatPrice, getTokenData, getReadableName, getEthUsdPrice } from '../utils/api.js';
import _ from 'lodash';
import { ethers } from 'ethers';
import { markets } from '../config/markets.js';
import { parseSeaport } from './parseSeaport.js';
import { parseBlur } from './parseBlur.js';
import { parseSaleToken } from './parseSaleToken.js';
import { currencies } from '../config/currencies.js';
import { saleEventTypes } from '../config/logEventTypes.js';
import type { ContractData, DecodedLogData, SeaportOrder, BlurOrder } from '../types';
import { initializeTransactionData } from '../config/initialize.js';
import Web3EthAbi from 'web3-eth-abi';
import { alchemy } from '../config/setup.js';
import { parseSudoswap } from './parseSudoswap.js';

const isSeaport = (
    decodedLogData: DecodedLogData | SeaportOrder
): decodedLogData is SeaportOrder => {
    return (decodedLogData as SeaportOrder).offer !== undefined;
};

const isBlur = (decodedLogData: DecodedLogData | BlurOrder): decodedLogData is BlurOrder => {
    return (decodedLogData as BlurOrder).sell !== undefined;
};

async function parseTransaction(
    transactionHash: string,
    contractAddress: string,
    contractData: ContractData
) {
    const receipt = await alchemy.core.getTransactionReceipt(transactionHash);
    const recipient = receipt ? receipt.to.toLowerCase() : '';

    if (!receipt || !(recipient in markets)) {
        return null;
    }
    const tx = initializeTransactionData(transactionHash, contractData, recipient, contractAddress);
    const isSudo = tx.recipient === 'sudoswap';
    const isAggregator =
        tx.recipient === 'gem' || tx.recipient === 'genie' || tx.recipient === 'blurSwap';

    if (isSudo) {
        const parseResult = await parseSudoswap(tx);

        if (parseResult === null) return null;
    }

    for (const log of receipt.logs) {
        const logAddress = log.address.toLowerCase();
        const logMarket = _.get(markets, logAddress);

        if (logAddress in currencies && !isAggregator) {
            tx.currency = currencies[logAddress as keyof typeof currencies];
        }

        parseSaleToken(tx, log, logAddress);

        const isSale = logAddress === recipient && saleEventTypes.includes(log.topics[0]);
        const isAggregatorSale = logAddress in markets && saleEventTypes.includes(log.topics[0]);

        if (isSale || isAggregatorSale) {
            const marketLogDecoder = isSale
                ? tx.market.logDecoder
                : markets[logAddress as keyof typeof markets].logDecoder;

            if (marketLogDecoder === undefined) return null;

            const decodedLogData = Web3EthAbi.decodeLog(marketLogDecoder, log.data, []);

            if (isSeaport(decodedLogData)) {
                const parseResult = parseSeaport(tx, log, logMarket, decodedLogData);

                if (parseResult === false) continue;
            } else if (isBlur(decodedLogData)) {
                parseBlur(tx, logMarket, decodedLogData);
            } else if (tx.marketList.length + 1 === tx.tokens.length) {
                const decodedPrice =
                    logMarket.name === 'x2y2' ? decodedLogData.amount : decodedLogData.price;
                const price = Number(ethers.utils.formatUnits(decodedPrice, tx.currency.decimals));

                tx.totalPrice += price;
                tx.marketList.push(logMarket);
                tx.prices.push(formatPrice(price));
            }
        }
    }

    tx.quantity = tx.tokenType === 'ERC721' ? tx.tokens.length : _.sum(tx.tokens);

    if ((!tx.isNftTrader && tx.quantity === 0) || (tx.isNftTrader && !tx.swap.maker.address)) {
        console.error('No tokens found. Please check the contract address is correct.');
        return null;
    }
    if (tx.isNftTrader && tx.swap.maker.address && tx.swap.taker.address) {
        tx.swap.maker.name = await getReadableName(tx.swap.maker.address);
        tx.swap.taker.name = await getReadableName(tx.swap.taker.address);
    }
    tx.to = !tx.isNftTrader ? await getReadableName(tx.toAddr ?? '') : '';
    tx.from = !tx.isNftTrader ? await getReadableName(tx.fromAddr ?? '') : '';
    tx.tokenData = !tx.isNftTrader
        ? await getTokenData(contractAddress, tx.tokenId ?? '', tx.tokenType)
        : { name: 'NftTrader', image: 'dummy' };
    tx.tokenName = !tx.isNftTrader ? tx.tokenData?.name || `${tx.symbol} #${tx.tokenId}` : '';
    tx.sweeperAddr = receipt.from;
    tx.sweeper = isAggregator ? await getReadableName(tx.sweeperAddr) : '';
    tx.usdPrice =
        !tx.isNftTrader && (tx.currency.name === 'ETH' || tx.currency.name === 'WETH')
            ? await getEthUsdPrice(tx.totalPrice)
            : null;
    tx.ethUsdValue = tx.usdPrice ? `($ ${tx.usdPrice})` : '';

    return tx;
}

export { parseTransaction };
