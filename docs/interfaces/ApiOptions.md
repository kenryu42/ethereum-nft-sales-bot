[enft](../README.md) / [Exports](../modules.md) / ApiOptions

# Interface: ApiOptions

An object containing the authentication options for the Ethereum API providers.

## Table of contents

### Properties

- [alchemy](ApiOptions.md#alchemy)
- [infura](ApiOptions.md#infura)

## Properties

### alchemy

• `Optional` **alchemy**: `Object`

Alchemy object with API key (required if no Infura key is provided)

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `apiKey` | `string` | The Alchemy API key. |

#### Defined in

[types/interfaces/auth.interface.ts:26](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/interfaces/auth.interface.ts#L26)

___

### infura

• `Optional` **infura**: `Object`

Infura object with API key and secret (required if no Alchemy key is provided)

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `apiKey` | `string` | The Infura API key. |
| `apiKeySecret` | `string` | The Infura API key secret. |

#### Defined in

[types/interfaces/auth.interface.ts:31](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/types/interfaces/auth.interface.ts#L31)
