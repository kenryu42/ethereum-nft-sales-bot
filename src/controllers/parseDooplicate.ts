import { ethers } from 'ethers';
import type { DoopData, TransactionData } from '../types';
import { alchemy, DOOP_ABI, DOOPPROXY_ABI } from '../config/setup.js';

export async function parseDooplicate(tx: DoopData) {
    const transaction = await alchemy.core.getTransaction(tx.transactionHash ?? '');
    if (!transaction) return;

    try {
        const iface = new ethers.utils.Interface(DOOP_ABI);
        const parsedTxn = iface.parseTransaction(transaction);
        parseFunction(tx, parsedTxn);
        tx.totalPrice = Number(ethers.utils.formatEther(transaction.value.toString()));
    } catch (error) {
        const iface = new ethers.utils.Interface(DOOPPROXY_ABI);
        const parsedTxn = iface.parseTransaction(transaction);
        parseFunction(tx, parsedTxn)
        tx.totalPrice = Number(ethers.utils.formatEther(transaction.value.toString()));
    }
   
}

function parseFunction(tx: DoopData, parsedTxn: ethers.utils.TransactionDescription) {
    const functionName = parsedTxn.functionFragment.name;
    if (functionName === 'dooplicate') {
        const args = parsedTxn.args;
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