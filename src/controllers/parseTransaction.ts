import { formatPrice, getTokenData, getReadableName, getEthUsdPrice } from '../utils/api.js';
import _ from 'lodash';
import { ethers } from 'ethers';
import { markets } from '../config/markets.js';
import { parseSeaport } from './parseSeaport.js';
import { parseBlur } from './parseBlur.js';
import { parseNftTrader } from './parseNftTrader.js';
import { parseSaleToken } from './parseSaleToken.js';
import { parseSwapToken } from './parseSwapToken.js';
import { currencies } from '../config/currencies.js';
import { saleEventTypes } from '../config/logEventTypes.js';
import type { ContractData, DecodedLogData, SeaportOrder, SwapEvent, BlurOrder } from '../types';
import { initializeTransactionData } from '../config/initialize.js';
import Web3EthAbi from 'web3-eth-abi';
import { alchemy } from '../config/setup.js';
import { parseSudoswap } from './parseSudoswap.js';
import { parseKodexSeaport } from './parseKodexSeaport.js';
import { getTagFromDomain } from '../utils/seaport.js';

const isSeaport = (
    decodedLogData: DecodedLogData | SeaportOrder
): decodedLogData is SeaportOrder => {
    return (decodedLogData as SeaportOrder).offer !== undefined;
};

const isNftTrader = (decodedLogData: DecodedLogData | SwapEvent): decodedLogData is SwapEvent => {
    return (decodedLogData as SwapEvent)._swapId !== undefined;
};

const isBlur = (decodedLogData: DecodedLogData | BlurOrder): decodedLogData is BlurOrder => {
    return (decodedLogData as BlurOrder).sell !== undefined;
};

const isKodexSeaport = (
    decodedLogData: DecodedLogData | SeaportOrder,
    calldata: string
): decodedLogData is SeaportOrder => {
    return isSeaport(decodedLogData) && calldata.includes(getTagFromDomain('kodex.io'));
};

async function parseTransaction(
    transactionHash: string,
    contractAddress: string,
    contractData: ContractData
) {
    const receipt = await alchemy.core.getTransactionReceipt(transactionHash);
    const data = await alchemy.core.getTransaction(transactionHash);
    const recipient = receipt ? receipt.to.toLowerCase() : '';

    if (!receipt || !data || !data.data || !(recipient in markets)) {
        return null;
    }
    const tx = initializeTransactionData(transactionHash, contractData, recipient, contractAddress);
    const isSudo = tx.recipient === 'sudoswap';
    const isSwap = tx.recipient === 'nft-trader';
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

        if (tx.recipient === 'nft-trader') {
            parseSwapToken(tx, log, logAddress);
        } else {
            parseSaleToken(tx, log, logAddress);
        }

        const isSale = logAddress === recipient && saleEventTypes.includes(log.topics[0]);
        const isAggregatorSale = logAddress in markets && saleEventTypes.includes(log.topics[0]);

        if (isSale || isAggregatorSale) {
            const marketLogDecoder = isSale
                ? tx.market.logDecoder
                : markets[logAddress as keyof typeof markets].logDecoder;

            if (marketLogDecoder === undefined) return null;

            const decodedLogData = Web3EthAbi.decodeLog(marketLogDecoder, log.data, []);

            if (isKodexSeaport(decodedLogData, data.data)) {
                const parseResult = parseKodexSeaport(tx, logMarket, decodedLogData);

                if (parseResult === null) continue;
            } else if (isSeaport(decodedLogData)) {
                const parseResult = parseSeaport(tx, logMarket, decodedLogData);

                if (parseResult === null) continue;
            } else if (isNftTrader(decodedLogData)) {
                const parseResult = await parseNftTrader(tx, log, logAddress, decodedLogData);

                if (parseResult === null) return null;
            } else if (isBlur(decodedLogData)) {
                const parseResult = parseBlur(tx, logMarket, decodedLogData);

                if (parseResult === null) return null;
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

    if ((!isSwap && tx.quantity === 0) || (isSwap && !tx.swap.monitorTokenId)) {
        console.error('No tokens found. Please check the contract address is correct.');
        return null;
    }
    tx.to = !isSwap ? await getReadableName(tx.toAddr ?? '') : '';
    tx.from = !isSwap ? await getReadableName(tx.fromAddr ?? '') : '';
    tx.tokenData = tx.swap.monitorTokenId
        ? await getTokenData(contractAddress, tx.swap.monitorTokenId, tx.tokenType)
        : await getTokenData(contractAddress, tx.tokenId ?? '', tx.tokenType);
    tx.tokenName = tx.tokenData.name || `${tx.symbol} #${tx.tokenId}`;
    tx.sweeperAddr = receipt.from;
    tx.sweeper = isAggregator ? await getReadableName(tx.sweeperAddr) : '';
    tx.usdPrice =
        !isSwap && (tx.currency.name === 'ETH' || tx.currency.name === 'WETH')
            ? await getEthUsdPrice(tx.totalPrice)
            : null;
    tx.ethUsdValue = tx.usdPrice ? `($ ${tx.usdPrice})` : '';

    return tx;
}

export { parseTransaction };
