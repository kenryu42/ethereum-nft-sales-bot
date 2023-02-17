import axios from 'axios';
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
const getContractMetadata_Alchemy = async (
    contractAddress: string,
    apiAuth: ApiAuth
): Promise<ContractMetadata> => {
    const url = `https://eth-mainnet.g.alchemy.com/v2/${apiAuth.alchemy}/getContractMetadata`;
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };
    const params = {
        contractAddress: contractAddress
    };

    const result = retry(
        async () => {
            const response = await axios.get(url, {
                headers,
                params
            });
            const contractMetadata = response.data.contractMetadata;
            const data = {
                name:
                    contractMetadata.name ??
                    contractMetadata.openSea.collectionName,
                symbol: contractMetadata.symbol,
                tokenType: contractMetadata.tokenType
            };

            return data;
        },
        { retries: 2 }
    );

    return result;
};

/**
 *
 * Get NFT metadata from Alchemy API.
 *
 * @async
 * @function
 * @param {string} contractAddress - The contract address of the NFT.
 * @param {string} tokenId - The token ID of the NFT.
 * @param {ApiAuth} apiAuth - The authentication data for the API.
 * @returns {Promise<{ name?: string; image: string }>} An object containing the name and image URL of the NFT.
 **/
const getNftMetadata_Alchemy = async (
    contractAddress: string,
    tokenId: string,
    apiAuth: ApiAuth
): Promise<{ name?: string; image: string }> => {
    const url = `https://eth-mainnet.g.alchemy.com/v2/${apiAuth.alchemy}/getNFTMetadata`;
    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    };
    const params = {
        contractAddress: contractAddress,
        tokenId: tokenId,
        refreshCache: true
    };

    const result = retry(async () => {
        const response = await axios.get(url, {
            headers,
            params
        });
        const data = response.data;
        const name = data?.metadata?.name;
        const isSvg = data?.media[0]?.format === 'svg+xml';
        let image = isSvg
            ? data?.media[0]?.thumbnail ??
              data?.media[0]?.gateway ??
              data?.media[0]?.raw
            : data?.media[0]?.gateway ?? data?.media[0]?.raw;

        if (!image) {
            log.throwMissingArgumentError('nft.image', {
                location: Logger.location.API_GET_NFT_METADATA_ALCHEMY
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

export { getNftMetadata_Alchemy, getContractMetadata_Alchemy };
