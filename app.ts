import { runApp } from './controllers/runApp';
import {
    WEB3,
    ABI,
    TOKEN_TYPE,
    CONTRACT_ADDRESS,
    CONTRACT_ADDRESSES,
    DEFAULT_NFT_API
} from './config/setup';
import { AbiItem } from 'web3-utils';
import { options } from './config/commander';
import { getContractData } from './utils/api';
import { EventData } from 'web3-eth-contract';
import { ContractData } from './types/types';

let lastTransactionHash: string;

console.log(`Default NFT Api: ${DEFAULT_NFT_API}`);

async function main(contractAddress: string) {
    const contractData: ContractData = await getContractData(contractAddress);
    const tokenType = contractData!.tokenType === 'unknown' ? TOKEN_TYPE : contractData!.tokenType;

    if (tokenType !== 'ERC721' && tokenType !== 'ERC1155') {
        console.log(contractData);
        console.log('Alchemy getContractMetadata api cannot get the correct token type.');
        console.log('Please enter the TOKEN_TYPE in (file:./.env)');
        process.exit(1);
    }
    const contract = new WEB3.eth.Contract(ABI as AbiItem[], contractAddress);

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
                    `Listening to ${tokenType} ${eventType[i]} events on collection: ${
                        contractData!.name
                    }`
                );
                console.log(`Contract address: ${contractAddress}\n`);
            })
            .on('data', async (data: EventData) => {
                const transactionHash = data.transactionHash.toLowerCase();

                if (transactionHash == lastTransactionHash) return;
                lastTransactionHash = transactionHash;

                await runApp(WEB3, transactionHash, contractAddress, contractData);
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
                contractData.tokenType === 'unknown' ? TOKEN_TYPE : contractData.tokenType;

            if (tokenType !== 'ERC721' && tokenType !== 'ERC1155') {
                console.log(contractData);
                console.log('Alchemy getContractMetadata api cannot get the correct token type.');
                console.log('Please enter the TOKEN_TYPE in (file:./.env)');
                process.exit(1);
            }
            console.log(`Running test for tx: ${options.test}`);
            await runApp(WEB3, options.test, CONTRACT_ADDRESS, contractData);
            process.exit(0);
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
