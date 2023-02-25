[enft](../README.md) / [Exports](../modules.md) / Auth

# Class: Auth

## Table of contents

### Constructors

- [constructor](Auth.md#constructor)

### Methods

- [getApiAuth](Auth.md#getapiauth)
- [getProvider](Auth.md#getprovider)

## Constructors

### constructor

• **new Auth**(`opts`)

The main class for the Auth library.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | [`AuthOptions`](../modules.md#authoptions) | An object containing the authentication options for the Ethereum API providers. |

#### Defined in

[Auth/Auth.ts:29](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/d8d9fbf/src/Auth/Auth.ts#L29)

## Methods

### getApiAuth

▸ **getApiAuth**(): `Object`

Retrieves the API authentication data for the Ethereum API providers.

**`Function`**

#### Returns

`Object`

- An object containing the API authentication data for the Ethereum API providers.

| Name | Type |
| :------ | :------ |
| `alchemy` | `undefined` \| `string` |
| `infura` | `undefined` \| `string` |

#### Defined in

[Auth/Auth.ts:58](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/d8d9fbf/src/Auth/Auth.ts#L58)

___

### getProvider

▸ **getProvider**(): `Provider`

Retrieves the Ethereum provider.

**`Function`**

#### Returns

`Provider`

- The Ethereum provider.

#### Defined in

[Auth/Auth.ts:49](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/d8d9fbf/src/Auth/Auth.ts#L49)
