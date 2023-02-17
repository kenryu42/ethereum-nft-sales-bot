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

export interface ApiOptions {
    alchemy?: {
        apiKey: string;
    };
    infura?: {
        apiKey: string;
        apiKeySecret: string;
    };
}

export type AuthOptions = RequireAtLeastOne<ApiOptions, 'alchemy' | 'infura'>;

export type ApiAuth = {
    alchemy: string | undefined;
    infura: string | undefined;
};
