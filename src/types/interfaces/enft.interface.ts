import type { ApiAuth } from './auth.interface.js';
import type { Provider } from 'ethers';
import type {
    TokenType,
    ContractMetadata
} from '../contracts/token.contract.js';

export interface ClientOptions {
    contractAddress: string;
    transactionHash?: string;
    tokenType?: TokenType;
    discordWebhook?: string;
    twitterConfig?: TwitterConfig;
    etherscanApiKey?: string;
    test?: boolean;
}

export interface Config {
    apiAuth: ApiAuth;
    provider: Provider;
    contractAddress: string;
    contractMetadata: ContractMetadata;
}

export interface Options {
    discordEnabled: boolean;
    twitterEnabled: boolean;
    discordWebhook?: string;
    twitterConfig?: TwitterConfig;
    etherscanApiKey?: string;
    test?: boolean;
}

export interface TwitterConfig {
    appKey: string;
    appSecret: string;
    accessToken: string;
    accessSecret: string;
}
