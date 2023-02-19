[enft](README.md) / Exports

# enft

## Table of contents

### Enumerations

- [ItemType](enums/ItemType.md)

### Classes

- [Auth](classes/Auth.md)
- [ENFT](classes/ENFT.md)

### Interfaces

- [ApiOptions](interfaces/ApiOptions.md)
- [ClientOptions](interfaces/ClientOptions.md)
- [Config](interfaces/Config.md)
- [Options](interfaces/Options.md)
- [Swap](interfaces/Swap.md)
- [SwapData](interfaces/SwapData.md)
- [TwitterConfig](interfaces/TwitterConfig.md)

### Type Aliases

- [ApiAuth](modules.md#apiauth)
- [AuthOptions](modules.md#authoptions)
- [Callback](modules.md#callback)
- [ConsiderationItem](modules.md#considerationitem)
- [ContractMetadata](modules.md#contractmetadata)
- [Currency](modules.md#currency)
- [CurrencyAddress](modules.md#currencyaddress)
- [Market](modules.md#market)
- [MarketName](modules.md#marketname)
- [OfferItem](modules.md#offeritem)
- [RequireAtLeastOne](modules.md#requireatleastone)
- [SwapTokenData](modules.md#swaptokendata)
- [TokenData](modules.md#tokendata)
- [TokenType](modules.md#tokentype)
- [TransactionData](modules.md#transactiondata)

## Type Aliases

### ApiAuth

Ƭ **ApiAuth**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `alchemy` | `string` \| `undefined` |
| `infura` | `string` \| `undefined` |

#### Defined in

[types/interfaces/auth.interface.ts:41](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/interfaces/auth.interface.ts#L41)

___

### AuthOptions

Ƭ **AuthOptions**: [`RequireAtLeastOne`](modules.md#requireatleastone)<[`ApiOptions`](interfaces/ApiOptions.md), ``"alchemy"`` \| ``"infura"``\>

#### Defined in

[types/interfaces/auth.interface.ts:39](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/interfaces/auth.interface.ts#L39)

___

### Callback

Ƭ **Callback**<`Event`\>: (`event`: `Event`) => `unknown`

#### Type parameters

| Name |
| :------ |
| `Event` |

#### Type declaration

▸ (`event`): `unknown`

##### Parameters

| Name | Type |
| :------ | :------ |
| `event` | `Event` |

##### Returns

`unknown`

#### Defined in

[types/utils/type.utils.ts:1](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/utils/type.utils.ts#L1)

___

### ConsiderationItem

Ƭ **ConsiderationItem**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `amount` | `BigNumberish` |
| `identifier` | `string` |
| `itemType` | [`ItemType`](enums/ItemType.md) |
| `recipient` | `string` |
| `token` | `string` |

#### Defined in

[types/contracts/seaport.contract.ts:11](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/contracts/seaport.contract.ts#L11)

___

### ContractMetadata

Ƭ **ContractMetadata**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `symbol` | `string` |
| `tokenType` | [`TokenType`](modules.md#tokentype) |

#### Defined in

[types/contracts/token.contract.ts:21](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/contracts/token.contract.ts#L21)

___

### Currency

Ƭ **Currency**: { [key in CurrencyAddress]: Object }

#### Defined in

[types/models/market.model.ts:31](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/models/market.model.ts#L31)

___

### CurrencyAddress

Ƭ **CurrencyAddress**: ``"0x0000000000000000000000000000000000000000"`` \| ``"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"`` \| ``"0x6b175474e89094c44da98b954eedeac495271d0f"`` \| ``"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"`` \| ``"0x4d224452801aced8b2f0aebe155379bb5d594381"``

#### Defined in

[types/models/market.model.ts:24](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/models/market.model.ts#L24)

___

### Market

Ƭ **Market**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `accountPage` | `string` |
| `color` | `number` |
| `contract` | `string` |
| `displayName` | `string` |
| `iconURL` | `string` |
| `name` | [`MarketName`](modules.md#marketname) |
| `site` | `string` |
| `topics` | `string`[] |

#### Defined in

[types/models/market.model.ts:1](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/models/market.model.ts#L1)

___

### MarketName

Ƭ **MarketName**: ``"opensea"`` \| ``"looksrare"`` \| ``"x2y2"`` \| ``"gem"`` \| ``"genie"`` \| ``"nfttrader"`` \| ``"sudoswap"`` \| ``"blur"`` \| ``"blurswap"`` \| ``"unknown"``

#### Defined in

[types/models/market.model.ts:12](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/models/market.model.ts#L12)

___

### OfferItem

Ƭ **OfferItem**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `amount` | `BigNumberish` |
| `identifier` | `string` |
| `itemType` | [`ItemType`](enums/ItemType.md) |
| `token` | `string` |

#### Defined in

[types/contracts/seaport.contract.ts:4](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/contracts/seaport.contract.ts#L4)

___

### RequireAtLeastOne

Ƭ **RequireAtLeastOne**<`T`, `Keys`\>: `Pick`<`T`, `Exclude`<keyof `T`, `Keys`\>\> & { [K in Keys]-?: Required<Pick<T, K\>\> & Partial<Pick<T, Exclude<Keys, K\>\>\> }[`Keys`]

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `Keys` | extends keyof `T` = keyof `T` |

#### Defined in

[types/interfaces/auth.interface.ts:12](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/interfaces/auth.interface.ts#L12)

___

### SwapTokenData

Ƭ **SwapTokenData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `amount?` | `number` |
| `contractAddress` | `string` |
| `image?` | `string` |
| `name?` | `string` |
| `tokenId` | `string` |
| `tokenType` | [`TokenType`](modules.md#tokentype) |

#### Defined in

[types/contracts/swap.contract.ts:15](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/contracts/swap.contract.ts#L15)

___

### TokenData

Ƭ **TokenData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `image` | `string` |
| `markets?` | { `[key: string]`: { `amount`: `number` ; `market`: [`Market`](modules.md#market) ; `price`: { `currency`: { `decimals`: `number` ; `name`: `string`  } ; `value`: `string`  }  };  } |
| `name` | `string` |
| `tokenId?` | `string` |

#### Defined in

[types/contracts/token.contract.ts:5](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/contracts/token.contract.ts#L5)

___

### TokenType

Ƭ **TokenType**: ``"ERC721"`` \| ``"ERC1155"`` \| ``"UNKNOWN"``

#### Defined in

[types/contracts/token.contract.ts:3](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/contracts/token.contract.ts#L3)

___

### TransactionData

Ƭ **TransactionData**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `contractAddress` | `string` |
| `contractData` | [`ContractMetadata`](modules.md#contractmetadata) |
| `currency` | { `decimals`: `number` ; `name`: `string`  } |
| `currency.decimals` | `number` |
| `currency.name` | `string` |
| `fromAddr?` | `string` |
| `fromAddrName?` | `string` |
| `gifImage?` | `Buffer` \| `Uint8Array` |
| `interactedMarket` | [`Market`](modules.md#market) |
| `isAggregator` | `boolean` |
| `isBlurBid?` | `boolean` |
| `swap?` | [`Swap`](interfaces/Swap.md) |
| `toAddr?` | `string` |
| `toAddrName?` | `string` |
| `tokens` | { `[key: string]`: [`TokenData`](modules.md#tokendata);  } |
| `totalAmount` | `number` |
| `totalPrice` | `number` |
| `transactionHash` | `string` |
| `usdPrice?` | `string` \| ``null`` |

#### Defined in

[types/models/transaction.model.ts:8](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/models/transaction.model.ts#L8)
