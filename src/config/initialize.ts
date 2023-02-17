import { markets } from './markets.js';

import type { TransactionData } from '../types/models/transaction.model';
import type { ContractMetadata } from '../types/contracts/token.contract';

export const initializeTransactionData = (
    transactionHash: string,
    interactedAddress: string,
    contractData: ContractMetadata,
    contractAddress: string
) => {
    const isAggregator = ['gem', 'genie', 'blurswap'].includes(
        markets[interactedAddress].name
    );

    const tx: TransactionData = {
        interactedMarket: markets[interactedAddress],
        isAggregator: isAggregator,
        tokens: {},
        totalPrice: 0,
        totalAmount: 0,
        contractData: contractData,
        currency: { name: 'ETH', decimals: 18 },
        contractAddress: contractAddress,
        transactionHash: transactionHash
    };

    return tx;
};
