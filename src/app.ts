import { runApp } from './controllers/runApp.js';
import { runDoopApp } from './controllers/runDoopApp.js';
import {
    alchemy,
    TOKEN_TYPE,
    CONTRACT_ADDRESS,
    CONTRACT_ADDRESSES,
    DEFAULT_NFT_API,
    DOOP_ADDRESSES
} from './config/setup.js';
import { options } from './config/commander.js';
import { getContractData } from './utils/api.js';
import type { ContractData } from './types';
import { transferEventTypes, doopEventTypes } from './config/logEventTypes.js';
import { NftTokenType } from 'alchemy-sdk';

let lastTransactionHash: string;

console.log(`Default NFT Api: ${DEFAULT_NFT_API}`);

async function main(contractAddress: string, test = false) {
    console.log(contractAddress);
    const contractData: ContractData = await getContractData(contractAddress);
    console.log(contractData);
    contractData.tokenType =
        contractData.tokenType === 'UNKNOWN'
            ? (TOKEN_TYPE as NftTokenType)
            : contractData.tokenType;

    if (contractData.tokenType !== 'ERC721' && contractData.tokenType !== 'ERC1155') {
        console.log(contractData);
        console.log('Alchemy getContractMetadata api cannot get the correct token type.');
        console.log('Please enter the TOKEN_TYPE in (file:./.env)');
        process.exit(1);
    }
    const eventFilter = {
        address: contractAddress,
        topics: [transferEventTypes[contractData.tokenType]]
    };

    if (test) {
        console.log(`Running test for tx: ${options.test}`);
        await runApp(options.test, CONTRACT_ADDRESS, contractData);
    } else {
        console.log(
            `Listening to ${contractData.tokenType} transfer events on collection: ${contractData.name}`
        );
        console.log(`Contract address: ${contractAddress}\n`);
        alchemy.ws.on(eventFilter, async (log) => {
            const transactionHash = log.transactionHash.toLowerCase();

            if (transactionHash === lastTransactionHash) return;
            lastTransactionHash = transactionHash;

            await runApp(transactionHash, contractAddress, contractData);
        });
    }
}

async function doop(contractAddress: string, test = false) {
    console.log(contractAddress);

    const eventFilter = {
        address: contractAddress,
        topics: [doopEventTypes]
    };

    if (test) {
        console.log(`Running doop test for tx: ${options.test}`);
        await runDoopApp(options.test, contractAddress);
    } else {
        console.log('Listening to dooplication events on');
        console.log(`Contract address: ${contractAddress}\n`);
        alchemy.ws.on(eventFilter, async (log) => {
            const transactionHash = log.transactionHash.toLowerCase();

            if (transactionHash === lastTransactionHash) return;
            lastTransactionHash = transactionHash;

            await runDoopApp(transactionHash, contractAddress);
        });
    }
}

(async () => {
    if (options.test) {
        try {
            // await main(CONTRACT_ADDRESS, true);
            const contractAddresses = JSON.parse(DOOP_ADDRESSES);
            await doop(contractAddresses[0], true);
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    } else if (CONTRACT_ADDRESSES || DOOP_ADDRESSES) {
        if (CONTRACT_ADDRESSES) {
            const contractAddresses = JSON.parse(CONTRACT_ADDRESSES);
            console.log(contractAddresses);
            for (const contractAddress of contractAddresses) {
                await main(contractAddress);
            }
        }
        if (DOOP_ADDRESSES) {
            const contractAddresses = JSON.parse(DOOP_ADDRESSES);
            console.log(contractAddresses);
            for (const contractAddress of contractAddresses) {
                await doop(contractAddress);
            }
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
