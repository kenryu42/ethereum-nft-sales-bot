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

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | [`AuthOptions`](../modules.md#authoptions) |

#### Defined in

Auth/Auth.ts:18

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

Auth/Auth.ts:47

___

### getProvider

▸ **getProvider**(): `Provider`

Retrieves the Ethereum provider.

**`Function`**

#### Returns

`Provider`

- The Ethereum provider.

#### Defined in

Auth/Auth.ts:38
