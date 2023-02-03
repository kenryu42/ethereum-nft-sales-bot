import { ethers } from 'ethers';
import type { DoopData } from '../types';
import { alchemy, DOOPMARKET_ABI, DOOPPROXY_ABI } from '../config/setup.js';

export async function parseDoopMarket(tx: DoopData) {
    const transaction = await alchemy.core.getTransaction(tx.transactionHash ?? '');
    if (!transaction) return;

    const iface = new ethers.utils.Interface(DOOPPROXY_ABI);
    const parsedTxn = iface.parseTransaction(transaction);
    const functionName = parsedTxn.functionFragment.name;

    if (functionName === 'dooplicateItem') {
        const args = parsedTxn.args;
        (tx.buyerAddress = transaction.from),
            (tx.totalPrice = Number(ethers.utils.formatEther(transaction.value.toString())));
        tx.dooplicatorId = ethers.BigNumber.from(args['dooplicatorId']).toString();
        tx.tokenId = ethers.BigNumber.from(args['tokenId']).toString();
        tx.tokenAddress = args['tokenAddress']; // asset or ie. Doodles contract address
        tx.dooplicationAddress = args['dooplicationAddress']; // dooplication contract address
        tx.addressOnTheOtherSide = args['addressOnTheOtherSide'];
    } else {
        console.log(functionName);
        return null;
    }
}
