import { markets } from './markets.js';
import type { ContractData, TransactionData } from '../types';

export const initializeTransactionData = (
    contractData: ContractData,
    recipient: string,
    contractAddress: string
) => {
    const tx: TransactionData = {
        swap: {},
        isSwap: markets[recipient].name === 'NFT Trader 🔄',
        isAggregator: markets[recipient].name === 'Gem 💎' || markets[recipient].name === 'Genie 🧞‍♂️',
        isSudo: markets[recipient].name === 'Sudoswap',
        tokens: [],
        prices: [],
        totalPrice: 0,
        symbol: contractData.symbol,
        tokenType: contractData.tokenType,
        contractName: contractData.name,
        marketList: [],
        market: markets[recipient],
        currency: { name: 'ETH', decimals: 18 },
        contractAddress: contractAddress
    };

    return tx;
};
