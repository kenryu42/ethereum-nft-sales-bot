import type { Market } from '../models/market.model.js';

export type TokenType = 'ERC721' | 'ERC1155' | 'UNKNOWN';

export type TokenData = {
    tokenId?: string;
    name: string;
    image: string;
    markets?: {
        [key: string]: {
            market: Market;
            amount: number;
            price: {
                value: string;
                currency: { name: string; decimals: number };
            };
        };
    };
};

export type ContractMetadata = {
    name: string;
    symbol: string;
    tokenType: TokenType;
};
