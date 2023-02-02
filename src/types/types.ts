import type { BigNumberish } from 'ethers';
import type { NftTokenType } from 'alchemy-sdk';
import type { ColorResolvable } from 'discord.js';

export interface CustomError extends Error {
    response?: {
        status: number;
        data: string;
    };
}

export type ContractData = {
    name: string | undefined;
    symbol: string | undefined;
    tokenType: NftTokenType;
};

export type TokenData = {
    name: string | null;
    image: string | null;
};

type SwapTokenData = {
    name?: string;
    tokenId: string;
    tokenType: NftTokenType;
    quantity?: number;
    contractAddress: string;
};

interface SwapData {
    name?: string;
    address?: string;
    spentAssets: SwapTokenData[];
    spentAmount?: string;
}

export interface Swap {
    maker: SwapData;
    taker: SwapData;
}

export enum ItemType {
    // 0: ETH on mainnet, MATIC on polygon, etc.
    NATIVE,

    // 1: ERC20 items (ERC777 and ERC20 analogues could also technically work)
    ERC20,

    // 2: ERC721 items
    ERC721,

    // 3: ERC1155 items
    ERC1155,

    // 4: ERC721 items where a number of tokenIds are supported
    ERC721_WITH_CRITERIA,

    // 5: ERC1155 items where a number of ids are supported
    ERC1155_WITH_CRITERIA
}

export type Market = {
    name: Recipient;
    displayName: string;
    color: ColorResolvable;
    site: string;
    accountPage: string;
    iconURL: string;
    logDecoder?: {
        type: string;
        name: string;
        components?: {
            type: string;
            name: string;
            components?: {
                type: string;
                name: string;
            }[];
        }[];
    }[];
};

export type DecodedLogData = { [key: string]: string };

export type OfferItem = {
    itemType: ItemType;
    token: string;
    identifier: string;
    amount: BigNumberish;
};

export type ConsiderationItem = {
    itemType: ItemType;
    token: string;
    identifier: string;
    amount: BigNumberish;
    recipient: string;
};

export type SeaportOrder = {
    offerer: string;
    offer: OfferItem[];
    consideration: ConsiderationItem[];
    recipient: string;
};

export type Fee = {
    rate: number;
    recipient: string;
};

export type Order = {
    trader: string;
    side: number;
    matchingPolicy: string;
    collection: string;
    tokenId: BigNumberish;
    amount: BigNumberish;
    paymentToken: string;
    price: BigNumberish;
    listingTime: BigNumberish;
    expirationTime: BigNumberish;
    fees: Fee[];
    salt: BigNumberish;
    extraParams: string;
};

export type BlurOrder = {
    maker: string;
    taker: string;
    sell: Order;
    sellhash: string;
    buy: Order;
    buyhash: string;
};

export type SwapEvent = {
    _creator: string;
    _time: string;
    _status: number;
    _swapId: string;
    _counterpart: string;
    _referral: string;
};

export type Recipient =
    | 'opensea'
    | 'looksrare'
    | 'x2y2'
    | 'gem'
    | 'genie'
    | 'nft-trader'
    | 'sudoswap'
    | 'blur'
    | 'blurSwap'
    | 'dooplicator'
    | 'dooplicator-marketplace'
    | 'unknown';

export type TransactionData = {
    recipient: Recipient;
    swap: Swap;
    isNftTrader?: boolean;
    prices: string[];
    totalPrice: number;
    tokens: BigNumberish[];
    tokenId?: string;
    tokenData?: TokenData;
    symbol: string | undefined;
    tokenType: NftTokenType;
    contractName: string | undefined;
    market: Market;
    marketList: Market[];
    gifImage?: Buffer | Uint8Array;
    currency: { name: string; decimals: number };
    contractAddress: string;
    quantity: number;
    to?: string;
    from?: string;
    toAddr?: string;
    fromAddr?: string;
    tokenName?: string;
    sweeper?: string;
    sweeperAddr?: string;
    usdPrice?: string | null;
    ethUsdValue?: string;
    transactionHash: string;
    seaportIdentifiers: string[];
};

export type DoopData = {
    recipient: Recipient;
    totalPrice: number;
    tokenId: string;
    dooplicatorId: string;
    dooplicatorVault: string | undefined;
    tokenContract: string;
    tokenVault: string | undefined;
    addressOnTheOtherSide: string;
    contractName: string | undefined;
    currency: { name: string; decimals: number };
    contractAddress: string;
    to?: string;
    from?: string;
    toAddr?: string;
    fromAddr?: string;
    tokenName?: string;
    usdPrice?: string | null;
    ethUsdValue?: string;
    transactionHash: string;
};
