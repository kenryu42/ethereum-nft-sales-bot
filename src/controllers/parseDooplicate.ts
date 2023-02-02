import { ethers } from 'ethers';
import type { DoopData } from '../types';
import { alchemy, DOOP_ABI } from '../config/setup.js';

export async function parseDooplicate(tx: DoopData) {
    const transaction = await alchemy.core.getTransaction(tx.transactionHash ?? '');
    if (!transaction) return;

    const iface = new ethers.utils.Interface(DOOP_ABI);
    const parsedTxn = iface.parseTransaction(transaction);
    const functionName = parsedTxn.functionFragment.name;

    if (functionName === 'dooplicate') {
        const args = parsedTxn.args;
        tx.totalPrice = Number(ethers.utils.formatEther(transaction.value.toString()));
        tx.dooplicatorId = ethers.BigNumber.from(args['dooplicatorId']).toString();
        tx.dooplicatorVault = args['dooplicatorVault'];
        tx.tokenId = ethers.BigNumber.from(args['tokenId']).toString();
        tx.tokenContract = args['tokenContract'];
        tx.tokenVault = args['tokenVault'];
        tx.addressOnTheOtherSide = args['addressOnTheOtherSide'];
    } else {
        console.log(functionName);

        return null;
    }
}
