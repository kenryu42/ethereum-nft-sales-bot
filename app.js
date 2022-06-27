import { runApp } from './controllers/runApp.js';
import { WEB3, CONTRACT, CONTRACT_ADDRESS } from './config/setup.js';
import { options } from './config/commander.js';
import { getContractData } from './utils/api.js';

let lastTransactionHash;

async function main() {
	const contractData = await getContractData();
	const collectionName = contractData.collection.name;
	const tokenType = contractData.schema_name;

	const transferEvent =
		tokenType === 'ERC721'
			? CONTRACT.events.Transfer({})
			: CONTRACT.events.TransferSingle({});

	transferEvent
		.on('connected', (subscription_id) => {
			console.log(new Date().toString(), '\n');
			console.log('Subscription successfully connected.');
			console.log(`Subscription ID: ${subscription_id}\n`);
			console.log(
				`Listening to ${tokenType} sale events on collection: ${collectionName}`
			);
			console.log(`Contract address: ${CONTRACT._address}\n`);
		})
		.on('data', async (data) => {
			const transactionHash = data.transactionHash.toLowerCase();

			if (transactionHash == lastTransactionHash) return;
			lastTransactionHash = transactionHash;

			await runApp(WEB3, transactionHash, CONTRACT_ADDRESS, tokenType);
		})
		.on('error', (error, receipt) => {
			console.error(error);
			console.error(receipt);
		});
}

(async () => {
	if (options.test) {
		try {
			const contractData = await getContractData();
			// const contractName = contractData.name;
			const tokenType = contractData.schema_name;
			console.log(`Running test for tx: ${options.test}`);
			await runApp(WEB3, options.test, CONTRACT_ADDRESS, tokenType);
			WEB3.currentProvider.disconnect();
		} catch (error) {
			console.error(error);
			process.exit(1);
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
