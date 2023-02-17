import type { Market } from './market.model.js';
import type { Swap } from '../contracts/swap.contract.js';
import type {
    TokenData,
    ContractMetadata
} from '../contracts/token.contract.js';

export type TransactionData = {
    swap?: Swap;
    isAggregator: boolean;
    isBlurBid?: boolean;
    interactedMarket: Market;
    totalPrice: number;
    tokens: {
        [key: string]: TokenData;
    };
    contractData: ContractMetadata;
    gifImage?: Buffer | Uint8Array;
    currency: { name: string; decimals: number };
    contractAddress: string;
    totalAmount: number;
    toAddrName?: string;
    fromAddrName?: string;
    toAddr?: string;
    fromAddr?: string;
    usdPrice?: string | null;
    transactionHash: string;
};
