import { ethers } from 'ethers';
import { Logger, log } from '../Logger/index.js';
import authSchema from './auth.schema.js';

import type { Provider } from 'ethers';
import type { AuthOptions } from '../types/interfaces/auth.interface';

export class Auth {
    private readonly alchemy?: {
        apiKey: string;
    };
    private readonly infura?: {
        apiKey: string;
        apiKeySecret: string;
    };
    private readonly provider: Provider;

    /**
     *
     * The main class for the Auth library.
     *
     * @param {AuthOptions} opts - An object containing the authentication options for the Ethereum API providers.
     * @param {Object} opts.alchemy - An object containing the Alchemy API key (required if no Infura key is provided).
     * @param {string} opts.alchemy.apiKey - The Alchemy API key.
     * @param {Object} opts.infura - An object containing the Infura API key and secret (required if no Alchemy key is provided).
     * @param {string} opts.infura.apiKey - The Infura API key.
     * @param {string} opts.infura.apiKeySecret - The Infura API key secret.
     */
    constructor(opts: AuthOptions) {
        const { error } = authSchema.validate(opts);

        if (error) {
            log.throwMissingArgumentError(error.details[0].message, {
                location: Logger.location.AUTH_CONSTRUCTOR
            });
        }
        this.alchemy = opts.alchemy;
        this.infura = opts.infura;
        this.provider = this.setProvider();
    }

    /**
     *
     * Retrieves the Ethereum provider.
     *
     * @function
     * @returns {Provider} - The Ethereum provider.
     **/
    getProvider = (): Provider => this.provider;

    /**
     *
     * Retrieves the API authentication data for the Ethereum API providers.
     *
     * @function
     * @returns {{ alchemy: string | undefined, infura: string | undefined }} - An object containing the API authentication data for the Ethereum API providers.
     **/
    getApiAuth = (): {
        alchemy: string | undefined;
        infura: string | undefined;
    } => {
        return {
            alchemy: this.alchemy?.apiKey,
            infura: this.infura
                ? Buffer.from(
                      `${this.infura.apiKey}:${this.infura.apiKeySecret}`
                  ).toString('base64')
                : undefined
        };
    };

    /**
     * Sets the Ethereum provider based on the API authentication data for the Ethereum API providers.
     * @function
     * @throws {Error} Throws an error if no API key is provided for the Ethereum API providers.
     * @returns {Provider} - The Ethereum provider based on the API authentication data.
     **/
    private setProvider = (): Provider => {
        if (this.alchemy) {
            return new ethers.AlchemyProvider('homestead', this.alchemy.apiKey);
        } else if (this.infura) {
            return new ethers.InfuraProvider('homestead', this.infura.apiKey);
        } else {
            throw log.throwMissingArgumentError('No API key provided', {
                location: Logger.location.AUTH_SET_PROVIDER
            });
        }
    };
}
