import { ethers } from 'ethers';
import type { DoopData } from '../types';
import { alchemy, DOOPMARKET_ABI } from '../config/setup.js';

export async function parseDoopMarket(tx: DoopData) {
    const transaction = await alchemy.core.getTransaction(tx.transactionHash ?? '');
    if (!transaction) return;

    const iface = new ethers.utils.Interface(DOOPMARKET_ABI);
    const parsedTxn = iface.parseTransaction(transaction);
    const functionName = parsedTxn.functionFragment.name;

    if (functionName === 'ItemDooplicated') {
        const args = parsedTxn.args;
        console.log('parsedDoopMarket, ', args);
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
