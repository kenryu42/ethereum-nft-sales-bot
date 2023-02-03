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
        tokenAddress: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
        dooplicatorId: '',
        dooplicatorVault: '',
        dooplicatorAddress: '0x466cfcd0525189b573e794f554b8a751279213ac',
        tokenContract: '',
        tokenVault: '',
        addressOnTheOtherSide: '',
        contractName: '',
        currency: { name: 'ETH', decimals: 18 },
        contractAddress: contractAddress,
        transactionHash: transactionHash,
    };

    return tx;
};
