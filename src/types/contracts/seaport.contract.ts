import type { ItemType } from '../enums/seaport.enum.js';
import type { BigNumberish } from 'ethers';

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
