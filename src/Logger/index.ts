/* eslint-disable @typescript-eslint/no-explicit-any */
import { Auth } from '../Auth/Auth.js';
import version from '../_version.js';

import type { Config, Options } from '../types/interfaces/enft.interface.js';

export enum ErrorCode {
    NETWORK = '[NETWORK.ERROR]',
    RUNTIME = '[RUNTIME.ERROR]',
    API = '[API.ERROR]',
    ABI = '[ABI.ERROR]',
    INVALID_ARGUMENT = 'INVALID_ARGUMENT',
    MISSING_ARGUMENT = 'MISSING_ARGUMENT',
    UNEXPECTED_ARGUMENT = 'UNEXPECTED_ARGUMENT',
    UNKNOWN_TOKEN_TYPE = 'UNKNOWN_TOKEN_TYPE',
    UNSUPPORTED_TRANSACTION = 'UNSUPPORTED_TRANSACTION',
    IMAGE_ERROR = 'IMAGE_ERROR'
}

export enum ErrorLocation {
    // AUTH
    AUTH_CONSTRUCTOR = '[Auth.constructor]',
    AUTH_SET_PROVIDER = '[Auth.setProvider]',

    // ENFT
    ENFT_ON_ITEM_SOLD = '[ENFT.onItemSold]',
    ENFT_DEBUG_TRANSACTION = '[ENFT.debugTransaction]',
    ENFT_CHECK_TOKEN_TYPE = '[ENFT.checkTokenType]',

    // PARSE
    PARSE_X2Y2 = '[parseX2Y2]',
    PARSE_LOOKSRARE = '[parseLooksRare]',
    PARSE_BLUR = '[parseBlur]',
    PARSE_TRANSACTION = '[parseTransaction]',
    PARSE_SEAPORT = '[parseSeaport]',
    PARSE_SUDOSWAP = '[parseSudoswap]',

    // API
    API_SHORTEN_ADDRESS = '[API.shortenAddress]',
    API_GET_NFT_METADATA_ALCHEMY = '[API.getNFTMetadataAlchemy]',
    API_GET_NFT_METADATA_INFURA = '[API.getNFTMetadataInfura]',

    // DISCORD
    DISCORD_SET_IMAGE_FIELD = '[Discord.setImageField]',
    DISCORD_SEND_EMBED_MESSAGE = '[Discord.sendEmbedMessage]',
    DISCORD_HANDLE_DISCORD_WEBHOOK = '[Discord.handleDiscordWebhook]',

    // TWITTER
    TWITTER_CONSTRUCTOR = '[Twitter.constructor]',
    TWITTER_SEND_SWAP_TWEET = '[Twitter.sendSwapTweet]',
    TWITTER_TWEET = '[Twitter.tweet]',

    // IMAGE
    IMAGE_CREATE_GIF = '[image_createGif]',
    IMAGE_CREATE_SWAP_GIF = '[image_createSwapGif]',
    IMAGE_ADD_TOKEN_ID_TO_IMAGE = '[image_addTokenIdToImage]',
    IMAGE_ADD_QUANTITY_TO_IMAGE = '[image_addQuantityToImage]',
    IMAGE_PREPARE_GIF_ENCODING_DATA = '[image_prepareGifEncodingData]',
    IMAGE_GET_ARRAY_BUFFER = '[image_getArrayBuffer]'
}

export enum ErrorMessage {
    invalid_auth_instance = 'Invalid Auth instance.',

    invalid_contract_address = 'Invalid contract address.',
    invalid_transaction_hash = 'Invalid transaction hash.',
    invalid_provider = 'Invalid provider.',
    invalid_token_address = 'Invalid token address',

    axios_error = 'An Axios error occured',
    ethers_error = 'An Ethers error occured',

    unknown_token_type = 'Api cannot get the token type.\nPlease specify the <tokenType> (ERC721 or ERC1155) while calling on function.'
}

/**
 * @description A class to handle errors and logs.
 */
export class Logger {
    version?: string;

    static code = ErrorCode;

    static location = ErrorLocation;

    static message = ErrorMessage;

    constructor(_version: string) {
        Object.defineProperties(this, {
            version: {
                enumerable: true,
                value: _version,
                writable: false
            }
        });
    }

    /**
     *
     * Creates an error message with the given message and optional code and params.
     *
     * @function
     * @param {string} message - The error message.
     * @param {ErrorCode} [code] - The error code.
     * @param {any} [params] - The parameters associated with the error.
     * @returns {string} The error message.
     **/
    makeErrorMessage(message: string, code?: ErrorCode, params?: any): string {
        const optCode = !code ? Logger.code.RUNTIME : code;
        const optParams = !params ? {} : params;
        const messageDetails: Array<string> = [];

        Object.keys(optParams).forEach((key) => {
            const value = optParams[key];
            try {
                messageDetails.push(`${key}=${JSON.stringify(value)}`);
            } catch (error) {
                messageDetails.push(
                    `${key}=${JSON.stringify(optParams[key].toString())}`
                );
            }
        });
        messageDetails.push(`code=${optCode}`);
        messageDetails.push(`version=${this.version}`);

        let errorMsg = message;

        if (messageDetails.length) {
            errorMsg += ` (${messageDetails.join(', ')})`;
        }
        return errorMsg;
    }

    /**
     *
     * Throws an error with the given message and optional code and params.
     *
     * @function
     * @param message - The error message.
     * @param code - The error code.
     * @param params - The parameters associated with the error.
     * @throws {Error} The error message.
     **/
    throwError(message: string, code?: ErrorCode, params?: any): never {
        throw Error(this.makeErrorMessage(message, code, params));
    }

    /**
     *
     * Throws an argument error with the given message and optional code and params.
     *
     * @function
     * @param message  - The error message.
     * @param name  - The argument name.
     * @param value  - The argument value.
     * @param params  - The parameters associated with the error.
     * @throws {Error} The error message.
     **/
    throwArgumentError(
        message: string,
        name: string,
        value: any,
        ...params: any
    ): never {
        const addedParams = params;
        addedParams[0].argument = name;
        addedParams[0].value = value;
        return this.throwError(
            message,
            Logger.code.INVALID_ARGUMENT,
            ...addedParams
        );
    }

    /**
     *
     * Throws an missing argument error with the given message and optional code and params.
     *
     * @function
     * @param message - The error message.
     * @param params - The parameters associated with the error.
     * @throws {Error} The error message.
     **/
    throwMissingArgumentError(message?: string, ...params: any): never {
        return this.throwError(
            `missing argument: ${message}`,
            Logger.code.MISSING_ARGUMENT,
            ...params
        );
    }

    /**
     *
     * Throws an too many argument error with the given message and optional code and params.
     *
     * @function
     * @param message - The error message.
     * @param params - The parameters associated with the error.
     * @throws {Error} The error message.
     */
    throwTooManyArgumentError(message?: string, ...params: any): never {
        return this.throwError(
            `too many arguments: ${message}`,
            Logger.code.UNEXPECTED_ARGUMENT,
            ...params
        );
    }

    /**
     *
     * Console log the configuration options and NFT contract details.
     *
     * @function
     * @param auth - The Auth instance.
     * @param config - The Config instance.
     * @param options - The Options instance.
     */
    static consoleLog = (
        auth: Auth,
        config: Config,
        options: Options
    ): void => {
        console.log(
            `Alchemy Api: ${auth.getApiAuth().alchemy ? 'Enabled' : 'Disabled'}`
        );
        console.log(
            `Infura Api: ${auth.getApiAuth().infura ? 'Enabled' : 'Disabled'}`
        );
        console.log(
            `Etherscan Api: ${options.etherscanApiKey ? 'Enabled' : 'Disabled'}`
        );

        console.log(
            `Built-in Discord Notify: ${
                options.discordWebhook ? 'Enabled' : 'Disabled'
            }`
        );
        console.log(
            `Built-in Twitter Notify: ${
                options.twitterConfig ? 'Enabled' : 'Disabled'
            }`
        );
        console.log(`Token Type: ${config.contractMetadata.tokenType}`);
        console.log(`Contract address: ${config.contractAddress}`);
        console.log(
            `Listening to transfer events on collection: ${
                config.contractMetadata.name || config.contractMetadata.symbol
            }\n`
        );
    };
}

export const log = new Logger(version);
