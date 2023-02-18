import type { ApiAuth } from './auth.interface.js';
import type { Provider } from 'ethers';
import type {
    TokenType,
    ContractMetadata
} from '../contracts/token.contract.js';

export interface ClientOptions {
    /** NFT contract address (required) */
    contractAddress: string;
    /** Transaction hash (only required for debugTransaction) */
    transactionHash?: string;
    /** Token type <ERC721, ERC1155> (optional) */
    tokenType?: TokenType;
    /** Discord webhook for built-in notification (optional) */
    discordWebhook?: string;
    /** Twitter api config for built-in notification (optional) */
    twitterConfig?: TwitterConfig;
    /** Etherscan api key for eth to usd conversion (optional) */
    etherscanApiKey?: string;
    /** Test mode (optional) */
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
