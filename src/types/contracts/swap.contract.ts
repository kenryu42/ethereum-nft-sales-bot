import type { TokenType } from './token.contract.js';

export interface Swap {
    maker: SwapData;
    taker: SwapData;
}

export interface SwapData {
    name?: string;
    address?: string;
    spentAssets: SwapTokenData[];
    spentAmount?: string;
}

export type SwapTokenData = {
    tokenId: string;
    name?: string;
    image?: string;
    tokenType: TokenType;
    amount?: number;
    contractAddress: string;
};
