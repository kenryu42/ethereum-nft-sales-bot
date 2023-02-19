import { parseTransaction } from './parseTransaction.js';
import { handleEmbedMessage } from '../discord/handleEmbedMessage.js';
import { handleTweet } from '../twitter/handleTweet.js';

import type { TransactionData } from '../types/models/transaction.model.js';
import type { Config, Options } from '../types/interfaces/enft.interface.js';

/**
 *
 * Parses a transaction and handles the corresponding webhook notifications if enabled.
 *
 * @async
 * @function
 * @param {Config} config - The configuration for the client.
 * @param {string} transactionHash - The hash of the transaction to parse.
 * @param {Options} options - The options for the client.
 * @returns {Promise<TransactionData | null>} A promise that resolves with the transaction data if available, otherwise null.
 */
const execute = async (
    config: Config,
    transactionHash: string,
    options: Options
): Promise<TransactionData | null> => {
    const txData = await parseTransaction(transactionHash, config, options);

    if (txData && options.discordWebhook) {
        await handleEmbedMessage(txData, config, options);
    }

    if (txData && options.twitterConfig) {
        await handleTweet(txData, config, options);
    }

    return txData;
};

export { execute };
