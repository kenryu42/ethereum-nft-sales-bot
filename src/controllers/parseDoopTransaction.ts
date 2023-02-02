import _ from 'lodash';
import { doops } from '../config/doops.js';
import { parseDooplicate } from './parseDooplicate.js';
import { parseDoopMarket } from './parseDoopMarket.js';
import { initializeDoopData } from '../config/initializeDoop.js';
import { alchemy } from '../config/setup.js';

async function parseDoopTransaction(
    transactionHash: string,
    contractAddress: string
) {
    const receipt = await alchemy.core.getTransactionReceipt(transactionHash);
    const recipient = receipt ? receipt.to.toLowerCase() : '';
    console.log(recipient);
    const tx = initializeDoopData(
        transactionHash,
        recipient,
        contractAddress
    );

    if (!receipt || !(recipient in doops)) {
        return null;
    }
   

    for (const log of receipt.logs) {
        const logAddress = log.address.toLowerCase();
        const logDoop = _.get(doops, logAddress);
        
        if (logDoop.name === 'dooplicator'){
            const parseResult = await parseDooplicate(tx);
            console.log(tx);
            if (parseResult === null) return null;
        }
        if (logDoop.name === 'dooplicator-marketplace'){
            const parseResult = await parseDoopMarket(tx);

            if (parseResult === null) return null;
        }
    }

    return tx;
}

export { parseDoopTransaction };
