import { ethers } from 'ethers';
import type { TransactionData } from '../types';
import { alchemy, SUDOSWAP_ABI } from '../config/setup.js';

export async function parseSudoswap(tx: TransactionData) {
    const transaction = await alchemy.core.getTransaction(tx.transactionHash ?? '');
    if (!transaction) return;

    const iface = new ethers.utils.Interface(SUDOSWAP_ABI);
    const parsedTxn = iface.parseTransaction(transaction);
    const functionName = parsedTxn.functionFragment.name;

    if (functionName === 'swapETHForSpecificNFTs') {
        tx.totalPrice = Number(ethers.utils.formatEther(transaction.value.toString()));
    } else if (functionName === 'robustSwapETHForSpecificNFTs'){
        tx.totalPrice = Number(ethers.utils.formatEther(transaction.value.toString()));
    } else if (functionName === 'robustSwapNFTsForToken') {
        tx.totalPrice = Number(
            ethers.utils.formatEther(parsedTxn.args.swapList[0].minOutput.toString())
        );
    } else if (functionName === 'swapNFTsForToken') {
        tx.totalPrice = Number(ethers.utils.formatEther(parsedTxn.args.minOutput.toString()));
    } else {
        console.log(functionName);

        return null;
    }
}
