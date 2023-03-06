import { ethers } from 'ethers';
import retry from 'async-retry';
import {
    getNftMetadata_Alchemy,
    getContractMetadata_Alchemy
} from '../api/alchemy/api.js';
import {
    getNftMetadata_Infura,
    getContractMetadata_Infura
} from '../api/infura/api.js';
import { Logger, log } from '../Logger/index.js';

import type { Provider, TransactionReceipt, TransactionResponse } from 'ethers';
import type { ApiAuth } from '../types/interfaces/auth.interface';
import type { ContractMetadata } from '../types/contracts/token.contract';

/**
 *
 * Retrieves the metadata of an NFT smart contract from the Alchemy or Infura API.
 *
 * @async
 * @function
 * @param {string} contractAddress - The Ethereum address of the smart contract to retrieve metadata for.
 * @param {{ alchemy: string | undefined, infura: string | undefined }} apiAuth - An object containing the API authentication data for the Ethereum API providers.
 * @returns {Promise<ContractMetadata>} - A promise that resolves with the metadata of the smart contract.
 **/
const getContractMetadata = async (
    contractAddress: string,
    apiAuth: ApiAuth
): Promise<ContractMetadata> => {
    let result;

    if (apiAuth.alchemy && apiAuth.infura) {
        try {
            result = await getContractMetadata_Alchemy(
                contractAddress,
                apiAuth
            );
        } catch (error) {
            console.log(`Error: ${error}`);
            console.log('Alchemy API error, switch to Infura.');
            result = await getContractMetadata_Infura(contractAddress, apiAuth);
        }
    } else if (apiAuth.alchemy) {
        result = await getContractMetadata_Alchemy(contractAddress, apiAuth);
    } else {
        result = await getContractMetadata_Infura(contractAddress, apiAuth);
    }

    return result;
};

/**
 *
 * Retrieves the metadata of an NFT from the Alchemy or Infura API.
 *
 * @async
 * @function
 * @param {string} contractAddress - The Ethereum address of the NFT's smart contract.
 * @param {string} tokenId - The ID of the NFT to retrieve metadata for.
 * @param {{ alchemy: string | undefined, infura: string | undefined }} apiAuth - An object containing the API authentication data for the Ethereum API providers.
 * @returns {Promise<{ name?: string | undefined; image: string }>} - A promise that resolves with the metadata of the NFT.
 **/
const getNftMetadata = async (
    contractAddress: string,
    tokenId: string,
    apiAuth: ApiAuth
): Promise<{ name?: string | undefined; image: string }> => {
    let result;

    if (apiAuth.alchemy && apiAuth.infura) {
        try {
            result = await getNftMetadata_Alchemy(
                contractAddress,
                tokenId,
                apiAuth
            );
        } catch (error) {
            console.log(`Error: ${error}`);
            console.log('Alchemy API error, switch to Infura.');
            result = await getNftMetadata_Infura(
                contractAddress,
                tokenId,
                apiAuth
            );
        }
    } else if (apiAuth.alchemy) {
        result = await getNftMetadata_Alchemy(
            contractAddress,
            tokenId,
            apiAuth
        );
    } else {
        result = await getNftMetadata_Infura(contractAddress, tokenId, apiAuth);
    }

    return result;
};

/**
 *
 * Retrieves the ENS name associated with an Ethereum address from the provider.
 *
 * @async
 * @function
 * @param {string} address - The Ethereum address to retrieve the ENS name for.
 * @param {Provider} provider - The Ethereum provider to retrieve the ENS name from.
 * @returns {Promise<string | null>} ENS name associated with the address, or null if no ENS name is found.
 **/
const getENSName = async (
    address: string,
    provider: Provider
): Promise<string | null> => {
    try {
        const result = await provider.lookupAddress(address);

        return result;
    } catch {
        return null;
    }
};

/**
 *
 * Retrieves the OpenSea username associated with an Ethereum address from the OpenSea API.
 *
 * @async
 * @function
 * @param {string} address - The Ethereum address to retrieve the OpenSea username for.
 * @returns {Promise<string | null>} OpenSea username associated with the address, or null if no username is found.
 **/
const getOpenseaName = async (address: string): Promise<string | null> => {
    try {
      const response = await fetch(`https://api.opensea.io/api/v1/account/${address}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch account data for ${address}: ${response.status} ${response.statusText}`);
      }
      const result = await response.json();
  
      return result?.data?.user?.username;
    } catch {
      return null;
    }
  };

/**
 *
 * Shortens an Ethereum address to its first 6 and last 4 characters, with '...' in between.
 * Example: 0x1234567890abcdef1234567890abcdef12345678 -> 0x1234...5678
 *
 * @function
 * @param {string} address - The Ethereum address to be shortened.
 * @throws {Error} Throws an error if the address provided is not a valid Ethereum address.
 * @returns {string} - The shortened Ethereum address.
 **/
const shortenAddress = (address: string): string => {
    if (!ethers.isAddress(address)) {
        log.throwError(
            Logger.message.invalid_contract_address,
            Logger.code.INVALID_ARGUMENT,
            {
                location: Logger.location.API_SHORTEN_ADDRESS
            }
        );
    }
    return (
        address.substring(0, 6) + '...' + address.substring(address.length - 4)
    );
};

/**
 *
 * Retrieves a readable name for an Ethereum address.
 *
 * @function
 * @param {string} address - The Ethereum address to retrieve a readable name for.
 * @param {Provider} provider - The Ethereum provider to retrieve the ENS name from.
 * @returns {Promise<string>} - A promise that resolves with the readable name associated with the address.
 **/
const getReadableName = async (
    address: string,
    provider: Provider
): Promise<string> => {
    const result =
        (await getOpenseaName(address)) ||
        (await getENSName(address, provider)) ||
        shortenAddress(address);

    return result;
};

/**
 *
 * Retrieves the current Ethereum price in USD by making an API request to Etherscan.
 *
 * @async
 * @function
 * @param {number} ethPrice - The ETH price to be converted to USD.
 * @param {string} etherscanApiKey - The API key to be used for the Etherscan API request.
 * @returns {Promise<string>} - The current Ethereum price in USD.
 **/
const getEthUsdPrice = async (
    ethPrice: number,
    etherscanApiKey: string
  ): Promise<string> => {
    const url = `
        https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${etherscanApiKey}
    `;
    const result = await retry(
      async () => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch ETH price data: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        const ethusd = result?.result?.ethusd;
        const usdPrice = (ethPrice * ethusd).toFixed(2);
  
        if (!ethusd || !usdPrice) {
          throw new Error('Missing required data in response');
        }
  
        return parseFloat(usdPrice).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
      },
      {
        retries: 5
      }
    );
  
    return result;
  };

/**
 *
 * Retrieves a transaction with the specified transaction hash from
 * the specified Ethereum provider.
 *
 * @function
 * @param {string} transactionHash - The transaction hash to retrieve.
 * @param {Provider} provider - The Ethereum provider to retrieve the transaction from.
 * @returns {Promise<TransactionResponse>} - The transaction object.
 **/
const getTransaction = async (
    transactionHash: string,
    provider: Provider
): Promise<TransactionResponse> => {
    const result = await retry(
        async () => {
            const transaction = await provider.getTransaction(transactionHash);

            if (!transaction) {
                throw new Error('Error occured, try again');
            }

            return transaction;
        },
        {
            retries: 5
        }
    );

    return result;
};

/**
 *
 * Retrieves a transaction receipt with the specified transaction hash
 * from the specified Ethereum provider.
 *
 * @async
 * @function
 * @param {string} transactionHash - The transaction hash to retrieve the receipt for.
 * @param {Provider} provider - The Ethereum provider to retrieve the receipt from.
 * @returns {Promise<TransactionReceipt>} Transaction receipt object.
 **/
const getTransactionReceipt = async (
    transactionHash: string,
    provider: Provider
): Promise<TransactionReceipt> => {
    const result = await retry(
        async () => {
            const transactionReceipt = await provider.getTransactionReceipt(
                transactionHash
            );

            if (!transactionReceipt) {
                throw new Error('Error occured, try again');
            }

            return transactionReceipt;
        },
        {
            retries: 5
        }
    );

    return result;
};

export {
    getENSName,
    getNftMetadata,
    getContractMetadata,
    getEthUsdPrice,
    shortenAddress,
    getOpenseaName,
    getReadableName,
    getTransaction,
    getTransactionReceipt
};
