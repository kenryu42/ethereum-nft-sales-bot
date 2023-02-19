import { Auth } from '../Auth/Auth.js';
import { execute } from '../parsers/execute.js';
import { getContractMetadata } from '../api/api.js';
import { transferEventTopics } from '../config/logEventTypes.js';
import { Logger, log } from '../Logger/index.js';
import enftSchema from './enft.schema.js';

import type {
    TokenType,
    ContractMetadata
} from '../types/contracts/token.contract.js';
import type {
    Config,
    Options,
    ClientOptions
} from '../types/interfaces/enft.interface.js';
import type { Callback } from '../types/utils/type.utils.js';
import type { TransactionData } from '../types/models/transaction.model.js';

let lastTransactionHash: string;

/**
 * @class
 * The main class for the ENFT library.
 **/
export class ENFT {
    private readonly auth: Auth;

    constructor(auth: Auth) {
        if (!(auth instanceof Auth)) {
            throw new Error('Invalid auth object');
        }
        this.auth = auth;
    }

    /**
     *
     * Subscribes to the sales event of an NFT contract.
     *
     * @async
     * @function
     * @param {ClientOptions} opts - An object containing the options to subscribe to the sales event.
     * @param {string} opts.contractAddress - The address of the NFT contract (required).
     * @param {string} opts.transactionHash - The transaction hash only required for debugTransaction (optional).
     * @param {string} opts.tokenType - The token type <ERC721, ERC1155> (optional).
     * @param {string} opts.etherscanApiKey - The etherscan api key for eth to usd conversion (optional).
     * @param {string} opts.discordWebhook - The discord webhook for built-in notification (optional).
     * @param {TwitterConfig} opts.twitterConfig - The twitter api config for built-in notification (optional).
     * @param {boolean} opts.test - Test mode (optional).
     * @param {Callback} callback - An optional callback function to execute after the transaction is debugged.
     * @throws {Error} If the "opts" parameter is missing required properties.
     * @returns {Promise<() => void>} Returns a promise that resolves to a function.
     **/
    onItemSold = async (
        opts: ClientOptions,
        callback?: Callback<TransactionData>
    ): Promise<() => void> => {
        const { error } = enftSchema.validate(opts);

        if (error) {
            log.throwMissingArgumentError(error.details[0].message, {
                location: Logger.location.ENFT_ON_ITEM_SOLD
            });
        }

        const { config, options } = await this.init(opts);

        if (opts.tokenType) {
            config.contractMetadata.tokenType = opts.tokenType;
        }

        if (!opts.test) Logger.consoleLog(this.auth, config, options);

        return this.on(config, options, callback);
    };

    /**
     *
     * Debugs a transaction on the Ethereum blockchain using the provided options.
     *
     * @async
     * @function
     * @param {ClientOptions} opts - An object containing the options for the transaction to debug.
     * @param {string} opts.contractAddress - The address of the NFT contract (required).
     * @param {string} opts.transactionHash - The transaction hash only required for debugTransaction (optional).
     * @param {string} opts.tokenType - The token type <ERC721, ERC1155> (optional).
     * @param {string} opts.etherscanApiKey - The etherscan api key for eth to usd conversion (optional).
     * @param {string} opts.discordWebhook - The discord webhook for built-in notification (optional).
     * @param {TwitterConfig} opts.twitterConfig - The twitter api config for built-in notification (optional).
     * @param {boolean} opts.test - Test mode (optional).
     * @param {Callback} callback - An optional callback function to execute after the transaction is debugged.
     * @throws {Error} If the "opts" parameter is missing required properties.
     * @throws {Error} If the "transactionHash" property is missing from the "opts" parameter.
     * @returns {Promise<TransactionData | null | undefined>} A promise that resolves with the transaction data if available, otherwise null or undefined.
     **/
    debugTransaction = async (
        opts: ClientOptions,
        callback?: Callback<TransactionData>
    ): Promise<TransactionData | null | undefined> => {
        const { error } = enftSchema.validate(opts);

        if (error) {
            log.throwMissingArgumentError(error.details[0].message, {
                location: Logger.location.ENFT_DEBUG_TRANSACTION
            });
        }

        if (!opts.transactionHash) {
            throw log.throwMissingArgumentError('transactionHash', {
                location: Logger.location.ENFT_DEBUG_TRANSACTION
            });
        }

        const { config, options } = await this.init(opts);

        if (!opts.test) Logger.consoleLog(this.auth, config, options);

        const txData = await execute(config, opts.transactionHash, options);

        if (txData && callback) callback(txData);
        if (opts.test) return txData;

        console.log(`\nhttps://etherscan.io/tx/${opts.transactionHash}`);
    };

    /**
     *
     * Initializes the configuration and options for the client using the provided options.
     *
     * @async
     * @function
     * @param {ClientOptions} opts - An object containing the options for the client.
     * @throws {Error} If the contract metadata cannot be obtained or the token type is unknown and no default token type is provided.
     * @returns {Promise<{ config: Config, options: Options }>} A promise that resolves with an object containing the configuration and options for the client.
     */
    private init = async (
        opts: ClientOptions
    ): Promise<{ config: Config; options: Options }> => {
        const contractMetadata = await getContractMetadata(
            opts.contractAddress,
            this.auth.getApiAuth()
        );
        this.checkTokenType(contractMetadata, opts.tokenType);

        const config: Config = {
            apiAuth: this.auth.getApiAuth(),
            provider: this.auth.getProvider(),
            contractAddress: opts.contractAddress.toLowerCase(),
            contractMetadata: contractMetadata
        };
        const options: Options = {
            discordWebhook: opts.discordWebhook,
            twitterConfig: opts.twitterConfig,
            etherscanApiKey: opts.etherscanApiKey,
            test: opts.test
        };

        return { config, options };
    };

    /**
     *
     * Checks the token type of the contract metadata.
     *
     * @private
     * @function
     * @param {ContractMetadata} contractMetadata - The metadata of the contract to check.
     * @param {TokenType} [tokenType] - An optional token type to use if the contract's token type is unknown.
     * @throws {Error} If the contract's token type is unknown and no default token type is provided.
     */
    private checkTokenType = (
        contractMetadata: ContractMetadata,
        tokenType?: TokenType
    ) => {
        if (
            contractMetadata.tokenType !== 'ERC721' &&
            contractMetadata.tokenType !== 'ERC1155'
        ) {
            if (!tokenType) {
                log.throwError(
                    Logger.message.unknown_token_type,
                    Logger.code.UNKNOWN_TOKEN_TYPE,
                    {
                        location: Logger.location.ENFT_CHECK_TOKEN_TYPE
                    }
                );
            } else {
                contractMetadata.tokenType = tokenType;
            }
        }
    };

    /**
     *
     * Listens for transfer events on the specified contract and
     * executes the provided callback function when a new event is detected.
     *
     * @private
     * @async
     * @function
     * @param {Config} config - The configuration for the client.
     * @param {Options} options - The options for the client.
     * @param {Callback} [callback] - An optional callback function to execute when a new transfer event is detected.
     * @returns {Promise<() => void>} A promise that resolves with a function to stop listening for events.
     */
    private on = async (
        config: Config,
        options: Options,
        callback?: Callback<TransactionData>
    ): Promise<() => void> => {
        const tokenType = config.contractMetadata.tokenType;
        const eventFilter = {
            address: config.contractAddress,
            topics: [transferEventTopics[tokenType]]
        };

        config.provider.on(
            eventFilter,
            async (event: { transactionHash: string }) => {
                const transactionHash = event.transactionHash.toLowerCase();

                if (transactionHash === lastTransactionHash) return;
                lastTransactionHash = transactionHash;

                const txData = await execute(config, transactionHash, options);

                if (txData && callback) callback(txData);
            }
        );

        return () => {
            config.provider.off(eventFilter);
        };
    };
}
