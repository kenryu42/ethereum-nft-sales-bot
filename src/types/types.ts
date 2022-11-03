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

interface Swap {
    [key: string]: {
        name?: string;
        receivedAssets: SwapTokenData[];
        spentAssets?: SwapTokenData[];
        receivedAmount?: string;
        spentAmount?: string;
    };
}

export type SwapData = Swap & {
    id?: string;
    monitorTokenId?: string;
};

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
    itemType: string;
    token: string;
    identifier: string;
    amount: BigNumberish;
};

export type ConsiderationItem = {
    itemType: string;
    token: string;
    identifier: string;
    amount: BigNumberish;
    recipient: string;
};

export type SeaportOrder = {
    offer: OfferItem[];
    consideration: ConsiderationItem[];
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
    | 'unknown';

export type TransactionData = {
    recipient: Recipient;
    swap: SwapData;
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
    addressMaker?: string;
    addressTaker?: string;
    transactionHash: string;
};
