/*
type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<
    T,
    Exclude<keyof T, Keys>
> &
    {
        [K in Keys]-?: Required<Pick<T, K>> &
            Partial<Record<Exclude<Keys, K>, undefined>>;
    }[Keys];
 */

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
    T,
    Exclude<keyof T, Keys>
> &
    {
        [K in Keys]-?: Required<Pick<T, K>> &
            Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

/**
 * An object containing the authentication options for the Ethereum API providers.
 **/
export interface ApiOptions {
    /** Alchemy object with API key (required if no Infura key is provided) */
    alchemy?: {
        /** The Alchemy API key. */
        apiKey: string;
    };
    /** Infura object with API key and secret (required if no Alchemy key is provided) */
    infura?: {
        /** The Infura API key. */
        apiKey: string;
        /** The Infura API key secret. */
        apiKeySecret: string;
    };
}

export type AuthOptions = RequireAtLeastOne<ApiOptions, 'alchemy' | 'infura'>;

export type ApiAuth = {
    alchemy: string | undefined;
    infura: string | undefined;
};
