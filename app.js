import { runApp } from './controllers/runApp.js';
import { WEB3, ABI, CONTRACT_ADDRESS, CONTRACT_ADDRESSES } from './config/setup.js';
import { options } from './config/commander.js';
import { getContractData } from './utils/api.js';

let lastTransactionHash;

async function main(contractAddress = CONTRACT_ADDRESS) {
    const contractData = await getContractData(contractAddress);
    const collectionName = contractData.collection.name;
    const tokenType = contractData.schema_name;
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
                    `Listening to ${tokenType} ${eventType[i]} events on collection: ${collectionName}`
                );
                console.log(`Contract address: ${contract._address}\n`);
            })
            .on('data', async (data) => {
                const transactionHash = data.transactionHash.toLowerCase();

                if (transactionHash == lastTransactionHash) return;
                lastTransactionHash = transactionHash;

                await runApp(WEB3, transactionHash, contractAddress, tokenType);
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
            const contractData = await getContractData();
            const tokenType = contractData.schema_name;
            console.log(`Running test for tx: ${options.test}`);
            await runApp(WEB3, options.test, CONTRACT_ADDRESS, tokenType);
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
            await main();
        } catch (error) {
            console.error(error);
            process.exit(1);
        }
    }
})();
