import retry from 'async-retry';
import { Logger, log } from '../../Logger/index.js';

import type { ApiAuth } from '../../types/interfaces/auth.interface';
import type { ContractMetadata } from '../../types/contracts/token.contract';

/**
 *
 * Retrieves the metadata for an NFT contract from Infura API.
 *
 * @async
 * @function
 * @param {string} contractAddress - The address of the ERC721 contract to retrieve metadata for.
 * @param {ApiAuth} apiAuth - The API authentication credentials.
 * @returns {Promise<ContractMetadata>} - Contract metadata object.
 **/
const getContractMetadata_Infura = async (
    contractAddress: string,
    apiAuth: ApiAuth
): Promise<ContractMetadata> => {
    const url = `https://nft.api.infura.io/networks/1/nfts/${contractAddress}`;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Basic ${apiAuth.infura}`
    };

    const result = await retry(async () => {
        const response = await fetch(url, {
            headers
        });
        const data = await response.json();
        const contractData = {
            name: data.name,
            symbol: data.symbol,
            tokenType: data.tokenType
        };

        return contractData;
    });

    return result;
};

/**
 *
 * Get NFT metadata from Infura API.
 *
 * @async
 * @function
 * @param {string} contractAddress - The contract address of the NFT.
 * @param {string} tokenId - The token ID of the NFT.
 * @param {ApiAuth} apiAuth - The authentication data for the API.
 * @returns {Promise<{ name?: string; image: string }>} An object containing the name and image URL of the NFT.
 **/
const getNftMetadata_Infura = async (
    contractAddress: string,
    tokenId: string,
    apiAuth: ApiAuth
): Promise<{ name?: string; image: string }> => {
    const url = `https://nft.api.infura.io/networks/1/nfts/${contractAddress}/tokens/${tokenId}`;
    const headers = {
        Accept: 'application/json',
        Authorization: `Basic ${apiAuth.infura}`
    };

    const result = await retry(async () => {
        const response = await fetch(url, {
            headers
        });
        const data = await response.json();
        const name = data?.metadata?.name;
        let image = data?.metadata?.image ?? data.metadata?.image_data;

        if (!image) {
            log.throwMissingArgumentError('nft.image', {
                location: Logger.location.API_GET_NFT_METADATA_INFURA
            });
        }

        if (image.startsWith('ipfs://')) {
            image = image.replace('ipfs://', 'https://ipfs.io/ipfs/');
        }

        return {
            name,
            image
        };
    });

    return result;
};

export { getNftMetadata_Infura, getContractMetadata_Infura };
