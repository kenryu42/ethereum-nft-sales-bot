import { runApp } from './controllers/runApp.js';
import {
    ABI,
    TOKEN_TYPE,
    ALCHEMY_API_KEY,
    CONTRACT_ADDRESS,
    CONTRACT_ADDRESSES,
    DEFAULT_NFT_API
} from './config/setup.js';
import { AbiItem } from 'web3-utils';
import { options } from './config/commander.js';
import { getContractData } from './utils/api.js';
import { EventData } from 'web3-eth-contract';
import { ContractData } from './types/types';
import { HttpProvider } from 'web3-core';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';

let lastTransactionHash: string;
const web3 = createAlchemyWeb3(`wss://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`);

console.log(`Default NFT Api: ${DEFAULT_NFT_API}`);

async function main(contractAddress: string) {
    const contractData: ContractData = await getContractData(contractAddress);
    // if (!contractData) return;
    const tokenType = contractData.tokenType === 'UNKNOWN' ? TOKEN_TYPE : contractData.tokenType;

    if (tokenType !== 'ERC721' && tokenType !== 'ERC1155') {
        console.log(contractData);
        console.log('Alchemy getContractMetadata api cannot get the correct token type.');
        console.log('Please enter the TOKEN_TYPE in (file:./.env)');
        process.exit(1);
    }
    const contract = new web3.eth.Contract(ABI as AbiItem[], contractAddress);

    const transferEvents =
        tokenType === 'ERC721'
            ? [contract.events.Transfer({})]
            : [contract.events.TransferSingle({}), contract.events.TransferBatch({})];
    const eventType = tokenType === 'ERC721' ? ['Transfer'] : ['TransferSingle', 'TransferBatch'];

    for (let i = 0; i < transferEvents.length; i++) {
        transferEvents[i]
            .on('connected', (subscription_id: string) => {
                console.log(`Subscription ID: ${subscription_id}`);
                console.log(
                    `Listening to ${tokenType} ${eventType[i]} events on collection: ${contractData.name}`
                );
                console.log(`Contract address: ${contractAddress}\n`);
            })
            .on('data', async (data: EventData) => {
                const transactionHash = data.transactionHash.toLowerCase();

                if (transactionHash == lastTransactionHash) return;
                lastTransactionHash = transactionHash;

                await runApp(web3, transactionHash, contractAddress, contractData);
            })
            .on('error', (error: Error) => {
                console.error(error);
            });
    }
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
            await runApp(web3, options.test, CONTRACT_ADDRESS, contractData);

            const provider = web3.currentProvider as HttpProvider;

            provider.disconnect();
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
