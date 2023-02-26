[enft](../README.md) / [Exports](../modules.md) / ClientOptions

# Interface: ClientOptions

## Table of contents

### Properties

- [contractAddress](ClientOptions.md#contractaddress)
- [discordWebhook](ClientOptions.md#discordwebhook)
- [etherscanApiKey](ClientOptions.md#etherscanapikey)
- [test](ClientOptions.md#test)
- [tokenType](ClientOptions.md#tokentype)
- [transactionHash](ClientOptions.md#transactionhash)
- [twitterConfig](ClientOptions.md#twitterconfig)

## Properties

### contractAddress

• **contractAddress**: `string`

NFT contract address (required)

#### Defined in

[types/interfaces/enft.interface.ts:10](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/d8d9fbf/src/types/interfaces/enft.interface.ts#L10)

___

### discordWebhook

• `Optional` **discordWebhook**: `string`

Discord webhook for built-in notification (optional)

#### Defined in

[types/interfaces/enft.interface.ts:16](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/d8d9fbf/src/types/interfaces/enft.interface.ts#L16)

___

### etherscanApiKey

• `Optional` **etherscanApiKey**: `string`

Etherscan api key for eth to usd conversion (optional)

#### Defined in

[types/interfaces/enft.interface.ts:20](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/d8d9fbf/src/types/interfaces/enft.interface.ts#L20)

___

### test

• `Optional` **test**: `boolean`

Test mode (optional)

#### Defined in

[types/interfaces/enft.interface.ts:22](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/d8d9fbf/src/types/interfaces/enft.interface.ts#L22)

___

### tokenType

• `Optional` **tokenType**: [`TokenType`](../modules.md#tokentype)

Token type <ERC721, ERC1155> (optional)

#### Defined in

[types/interfaces/enft.interface.ts:14](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/d8d9fbf/src/types/interfaces/enft.interface.ts#L14)

___

### transactionHash

• `Optional` **transactionHash**: `string`

Transaction hash (only required for debugTransaction)

#### Defined in

[types/interfaces/enft.interface.ts:12](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/d8d9fbf/src/types/interfaces/enft.interface.ts#L12)

___

### twitterConfig

• `Optional` **twitterConfig**: [`TwitterConfig`](TwitterConfig.md)

Twitter api config for built-in notification (optional)

#### Defined in

[types/interfaces/enft.interface.ts:18](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/d8d9fbf/src/types/interfaces/enft.interface.ts#L18)
