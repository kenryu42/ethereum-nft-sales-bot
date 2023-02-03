import { ethers } from 'ethers';
import type { DoopData } from '../types';
import { alchemy, DOOP_ABI, DOOPPROXY_ABI } from '../config/setup.js';

export async function parseDooplicate(tx: DoopData) {
    const transaction = await alchemy.core.getTransaction(tx.transactionHash ?? '');
    if (!transaction) return;

    let parsedTxn = {};

    try {
        const iface = new ethers.utils.Interface(DOOP_ABI);
        parsedTxn = iface.parseTransaction(transaction);
    } catch (error) {
        const iface = new ethers.utils.Interface(DOOPPROXY_ABI);
        parsedTxn = iface.parseTransaction(transaction);
    }
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
    } else if (functionName === 'dooplicateItem') {
        console.log('dooplicateItem already occurred from marketplace');
    } else {
        console.log(functionName);
        return null;
    }
}
