import { markets } from './markets.js';
import type { ContractData, TransactionData } from '../types';

export const initializeTransactionData = (
    transactionHash: string,
    contractData: ContractData,
    recipient: string,
    contractAddress: string
) => {
    const tx: TransactionData = {
        swap: {},
        recipient: markets[recipient].name,
        tokens: [],
        prices: [],
        totalPrice: 0,
        quantity: 0,
        symbol: contractData.symbol,
        tokenType: contractData.tokenType,
        contractName: contractData.name,
        marketList: [],
        market: markets[recipient],
        currency: { name: 'ETH', decimals: 18 },
        contractAddress: contractAddress,
        transactionHash: transactionHash,
        seaportIdentifiers: []
    };

    return tx;
};
