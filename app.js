import { runApp } from './controllers/runApp.js';
import {
    WEB3,
    ABI,
    TOKEN_TYPE,
    CONTRACT_ADDRESS,
    CONTRACT_ADDRESSES,
    DEFAULT_NFT_API
} from './config/setup.js';
import { options } from './config/commander.js';
import { getContractData } from './utils/api.js';

let lastTransactionHash;

console.log(`Default NFT Api: ${DEFAULT_NFT_API}`);

async function main(contractAddress) {
    const contractData = await getContractData(contractAddress);
    const tokenType = contractData.tokenType === 'unknown' ? TOKEN_TYPE : contractData.tokenType;
    if (tokenType !== 'ERC721' && tokenType !== 'ERC1155') {
        console.log(contractData);
        console.log('Alchemy getContractMetadata api cannot get the correct token type.');
        console.log('Please enter the TOKEN_TYPE in (file:./.env)');
        process.exit(1);
    }
    const contract = new WEB3.eth.Contract(ABI, contractAddress);

    const transferEvents =
        tokenType === 'ERC721'
            ? [contract.events.Transfer({})]
            : [contract.events.TransferSingle({}), contract.events.TransferBatch({})];
    const eventType = tokenType === 'ERC721' ? ['Transfer'] : ['TransferSingle', 'TransferBatch'];

    for (let i = 0; i < transferEvents.length; i++) {
        transferEvents[i]
            .on('connected', (subscription_id) => {
                console.log(`Subscription ID: ${subscription_id}`);
                console.log(
                    `Listening to ${tokenType} ${eventType[i]} events on collection: ${contractData.name}`
                );
                console.log(`Contract address: ${contract._address}\n`);
            })
            .on('data', async (data) => {
                const transactionHash = data.transactionHash.toLowerCase();

                if (transactionHash == lastTransactionHash) return;
                lastTransactionHash = transactionHash;

                await runApp(WEB3, transactionHash, contractAddress, contractData);
            })
            .on('error', (error, receipt) => {
                console.error(error);
                console.error(receipt);
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
            WEB3.currentProvider.disconnect();
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
