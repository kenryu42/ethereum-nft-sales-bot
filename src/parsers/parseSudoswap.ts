import { ethers } from 'ethers';
import { createRequire } from 'module';
import { getTransaction } from '../api/api.js';
import { Logger, log } from '../Logger/index.js';

import type { Provider } from 'ethers';
import type { TransactionData } from '../types/models/transaction.model.js';

const require = createRequire(import.meta.url);
const SUDOSWAP_ABI = require('../abi/sudoSwap.json');

/**
 *
 * Parse Sudoswap transaction and update the given transaction data accordingly.
 *
 * @async
 * @function
 * @param {TransactionData} tx - Transaction data to be updated
 * @param {Provider} provider - Provider instance
 * @throws {Error} - If the transaction function is not supported
 **/
const parseSudoswap = async (tx: TransactionData, provider: Provider) => {
    const transaction = await getTransaction(tx.transactionHash, provider);
    const iface = new ethers.Interface(SUDOSWAP_ABI);
    const parsedTxn = iface.parseTransaction(transaction);
    const functionName = parsedTxn?.fragment.name;

    if (functionName === 'swapETHForSpecificNFTs') {
        tx.totalPrice = Number(
            ethers.formatEther(transaction.value.toString())
        );
    } else if (functionName === 'swapNFTsForToken') {
        tx.totalPrice = Number(
            ethers.formatEther(parsedTxn?.args.minOutput.toString())
        );
    } else if (functionName === 'robustSwapETHForSpecificNFTs') {
        tx.totalPrice = Number(
            ethers.formatEther(transaction.value.toString())
        );
    } else if (functionName === 'robustSwapNFTsForToken') {
        tx.totalPrice = Number(
            ethers.formatEther(parsedTxn?.args.swapList[0].minOutput.toString())
        );
    } else {
        log.throwError(
            `Unknown function: ${functionName}`,
            Logger.code.UNSUPPORTED_TRANSACTION,
            {
                location: Logger.location.PARSE_SUDOSWAP
            }
        );
    }
};

export { parseSudoswap };
