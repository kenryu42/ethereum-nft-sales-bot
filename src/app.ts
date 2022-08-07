import { runApp } from './controllers/runApp.js';
import {
    alchemy,
    TOKEN_TYPE,
    CONTRACT_ADDRESS,
    CONTRACT_ADDRESSES,
    DEFAULT_NFT_API
} from './config/setup.js';
import { options } from './config/commander.js';
import { getContractData } from './utils/api.js';
import type { ContractData } from './types';
import { transferEventTypes } from './config/logEventTypes.js';

let lastTransactionHash: string;

console.log(`Default NFT Api: ${DEFAULT_NFT_API}`);

async function main(contractAddress: string) {
    const contractData: ContractData = await getContractData(contractAddress);
    const tokenType = contractData.tokenType === 'UNKNOWN' ? TOKEN_TYPE : contractData.tokenType;

    if (tokenType !== 'ERC721' && tokenType !== 'ERC1155') {
        console.log(contractData);
        console.log('Alchemy getContractMetadata api cannot get the correct token type.');
        console.log('Please enter the TOKEN_TYPE in (file:./.env)');
        process.exit(1);
    }
    const eventFilter = {
        address: contractAddress,
        topics: [transferEventTypes[tokenType]]
    };

    console.log(`Listening to ${tokenType} transfer events on collection: ${contractData.name}`);
    console.log(`Contract address: ${contractAddress}\n`);
    alchemy.ws.on(eventFilter, async (log) => {
        const transactionHash = log.transactionHash.toLowerCase();

        if (transactionHash === lastTransactionHash) return;
        lastTransactionHash = transactionHash;

        await runApp(transactionHash, contractAddress, contractData);
    });
}

(async () => {
    if (options.test) {
        try {
            const contractData = await getContractData(CONTRACT_ADDRESS);
            const tokenType =
                contractData.tokenType === 'UNKNOWN' ? TOKEN_TYPE : contractData.tokenType;

            if (tokenType !== 'ERC721' && tokenType !== 'ERC1155') {
                console.log(contractData);
                console.log('Alchemy getContractMetadata api cannot get the correct token type.');
                console.log('Please enter the TOKEN_TYPE in (file:./.env)');
                process.exit(1);
            }
            console.log(`Running test for tx: ${options.test}`);
            await runApp(options.test, CONTRACT_ADDRESS, contractData);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    } else if (CONTRACT_ADDRESSES) {
        const contractAddresses = JSON.parse(CONTRACT_ADDRESSES);

        for (const contractAddress of contractAddresses) {
            await main(contractAddress);
        }
    } else {
        try {
            await main(CONTRACT_ADDRESS);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }
})();
