import { doops } from './doops.js';
import type { DoopData } from '../types';

export const initializeDoopData = (
    transactionHash: string,
    recipient: string,
    contractAddress: string
) => {
    const tx: DoopData = {
        recipient: doops[recipient].name,
        totalPrice: 0,
        tokenId: '',
        dooplicatorId: '',
        dooplicatorVault: '',
        tokenContract: '',
        tokenVault: '',
        addressOnTheOtherSide: '',
        contractName: '',
        currency: { name: 'ETH', decimals: 18 },
        contractAddress: contractAddress,
        transactionHash: transactionHash
    };

    return tx;
};
