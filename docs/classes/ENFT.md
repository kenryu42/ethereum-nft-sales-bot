[enft](../README.md) / [Exports](../modules.md) / ENFT

# Class: ENFT

## Table of contents

### Constructors

- [constructor](ENFT.md#constructor)

### Methods

- [debugTransaction](ENFT.md#debugtransaction)
- [onItemSold](ENFT.md#onitemsold)

## Constructors

### constructor

• **new ENFT**(`auth`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `auth` | [`Auth`](Auth.md) |

#### Defined in

[ENFT/ENFT.ts:29](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/ENFT/ENFT.ts#L29)

## Methods

### debugTransaction

▸ **debugTransaction**(`opts`, `callback?`): `Promise`<`undefined` \| ``null`` \| [`TransactionData`](../modules.md#transactiondata)\>

Debugs a transaction on the Ethereum blockchain using the provided options.

**`Async`**

**`Function`**

**`Throws`**

If the "opts" parameter is missing required properties.

**`Throws`**

If the "transactionHash" property is missing from the "opts" parameter.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | [`ClientOptions`](../interfaces/ClientOptions.md) | An object containing the options for the transaction to debug. |
| `callback?` | [`Callback`](../modules.md#callback)<[`TransactionData`](../modules.md#transactiondata)\> | An optional callback function to execute after the transaction is debugged. |

#### Returns

`Promise`<`undefined` \| ``null`` \| [`TransactionData`](../modules.md#transactiondata)\>

A promise that resolves with the transaction data if available, otherwise null or undefined.

#### Defined in

[ENFT/ENFT.ts:96](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/ENFT/ENFT.ts#L96)

___

### onItemSold

▸ **onItemSold**(`opts`, `callback?`): `Promise`<() => `void`\>

Subscribes to the sales event of an NFT contract.

**`Async`**

**`Function`**

**`Throws`**

If the "opts" parameter is missing required properties.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `opts` | [`ClientOptions`](../interfaces/ClientOptions.md) | An object containing the options to subscribe to the sales event. |
| `callback?` | [`Callback`](../modules.md#callback)<[`TransactionData`](../modules.md#transactiondata)\> | An optional callback function to execute after the transaction is debugged. |

#### Returns

`Promise`<() => `void`\>

Returns a promise that resolves to a function.

#### Defined in

[ENFT/ENFT.ts:54](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/a276033/src/ENFT/ENFT.ts#L54)
