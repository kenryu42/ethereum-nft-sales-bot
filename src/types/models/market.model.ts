export type Market = {
    name: MarketName;
    displayName: string;
    contract: string;
    color: number;
    site: string;
    accountPage: string;
    iconURL: string;
    topics: string[];
};

export type MarketName =
    | 'opensea'
    | 'looksrare'
    | 'x2y2'
    | 'gem'
    | 'genie'
    | 'nfttrader'
    | 'sudoswap'
    | 'blur'
    | 'blurswap'
    | 'unknown';

export type CurrencyAddress =
    | '0x0000000000000000000000000000000000000000'
    | '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    | '0x6b175474e89094c44da98b954eedeac495271d0f'
    | '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
    | '0x4d224452801aced8b2f0aebe155379bb5d594381';

export type Currency = {
    [key in CurrencyAddress]: {
        name: string;
        decimals: number;
    };
};
