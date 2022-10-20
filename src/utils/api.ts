import 'dotenv/config';
import _ from 'lodash';
import axios from 'axios';
import { ethers } from 'ethers';
import type { BigNumberish } from 'ethers';
import retry from 'async-retry';
import {
    alchemy,
    DEFAULT_NFT_API,
    OPENSEA_API_KEY,
    ALCHEMY_API_KEY,
    ETHERSCAN_API_KEY,
    KODEX_DIRECT_DATA_API
} from '../config/setup.js';
import type { NftTokenType } from 'alchemy-sdk';
import type { ContractData, CustomError, TokenData } from '../types';

const openseaNftApi = async (tokenId: BigNumberish, contractAddress: string) => {
    const baseURL = `https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenId}`;

    try {
        const response = await axios.get(baseURL, {
            headers: {
                'X-API-KEY': OPENSEA_API_KEY
            }
        });

        return response;
    } catch (error) {
        if (error instanceof Error) {
            const customError: CustomError = error;

            if (customError.response) {
                console.log(customError.response.data);
                console.log(customError.response.status);
            } else {
                console.error(error.message);
            }
        }

        return null;
    }
};

const retryOnOpenseaNftApi = async (
    tokenId: BigNumberish,
    contractAddress: string
): Promise<TokenData> => {
    const result = await retry(
        async () => {
            const response = await openseaNftApi(tokenId, contractAddress);

            if (response === null) {
                throw new Error('Might hitting rate limit, try again');
            }

            const data = _.get(response, 'data');

            return {
                name: _.get(data, 'name'),
                image: _.get(data, 'image_url')
            };
        },
        {
            retries: 5
        }
    );

    return result;
};

const getOpenseaName = async (address: string) => {
    try {
        const response = await axios.get(`https://api.opensea.io/api/v1/account/${address}`);

        const result = _.get(response, 'data');

        return _.get(result, ['data', 'user', 'username']);
    } catch (error) {
        console.log('getOpenseaName API error');
        console.log(`address: ${address}`);

        if (error instanceof Error) {
            const customError: CustomError = error;

            if (customError.response) {
                console.log(customError.response.data);
                console.log(customError.response.status);
            } else {
                console.error(error.message);
            }
        }

        return null;
    }
};

const getKodexName = async (address: string) => {
    if (!KODEX_DIRECT_DATA_API) return null;

    try {
        const response = await axios({
            url: KODEX_DIRECT_DATA_API,
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            data: {
                operationName: 'GetAddressUsername',
                query: 'query GetAddressUsername($address: String!) {users(where: {user: {_eq: $address}}) {username}}',
                variables: {
                    address: address.toLowerCase()
                }
            }
        });

        const result = _.get(response, 'data');
        const username = _.get(result, ['data', 'users', '0', 'username']);

        if (!username) return null;

        return `${username} @ 💾`;
    } catch (error) {
        console.log('getKodexName API error');
        console.log(`address: ${address}`);

        if (error instanceof Error) {
            const customError: CustomError = error;

            if (customError.response) {
                console.log(customError.response.data);
                console.log(customError.response.status);
            } else {
                console.error(error.message);
            }
        }

        return null;
    }
};

const retryOnGetNFTMetadata = async (
    contractAddress: string,
    tokenId: BigNumberish,
    tokenType: NftTokenType
): Promise<TokenData> => {
    const result = await retry(
        async () => {
            const response = await alchemy.nft.getNftMetadata(contractAddress, tokenId, tokenType);

            if (response === null) {
                throw new Error('Might hitting rate limit, try again');
            }

            return {
                name: _.get(response, 'title'),
                image: _.get(response, 'media[0].gateway')
            };
        },
        {
            retries: 5
        }
    );

    return result;
};

const retryOnGetContractMetadata = async (contractAddress: string): Promise<ContractData> => {
    const result = await retry(
        async () => {
            const response = await alchemy.nft.getContractMetadata(contractAddress);

            if (response === null) {
                throw new Error('Might hitting rate limit, try again');
            }

            return {
                name: _.get(response, 'name'),
                symbol: _.get(response, 'symbol'),
                tokenType: _.get(response, 'tokenType')
            };
        },
        {
            retries: 5
        }
    );

    return result;
};

const getAssetContract = async (contractAddress: string) => {
    try {
        const response = await axios.get(
            `https://api.opensea.io/api/v1/asset_contract/${contractAddress}`,
            {
                headers: {
                    'X-API-KEY': OPENSEA_API_KEY
                }
            }
        );

        return response;
    } catch (error) {
        console.log('getAssetContract API error');

        if (error instanceof Error) {
            const customError: CustomError = error;
            if (customError.response) {
                console.log(customError.response.data);
                console.log(customError.response.status);
            } else {
                console.error(error.message);
            }
        }
    }
};

const retryOnGetAssetContract = async (contractAddress: string): Promise<ContractData> => {
    const result = await retry(
        async () => {
            const response = await getAssetContract(contractAddress);

            if (response === null) {
                throw new Error('Might hitting rate limit, try again');
            }

            const data = _.get(response, 'data');

            return {
                name: _.get(data, ['collection', 'name']),
                symbol: _.get(data, 'symbol'),
                tokenType: _.get(data, 'schema_name')
            };
        },
        {
            retries: 5
        }
    );

    return result;
};

const getENSName = async (address: string) => {
    try {
        // const provider = new ethers.providers.CloudflareProvider();
        const provider = new ethers.providers.AlchemyProvider('homestead', ALCHEMY_API_KEY);
        const result = await provider.lookupAddress(address);

        return result;
    } catch (error) {
        console.log('API error: ', error);
    }
};

const getReadableName = async (address: string) => {
    const result =
        (await getKodexName(address)) ||
        (await getENSName(address)) ||
        (await getOpenseaName(address)) ||
        shortenAddress(address);

    return result;
};

const getTokenData = async (
    contractAddress: string,
    tokenId: BigNumberish,
    tokenType: NftTokenType
) => {
    let tokenData;

    if (DEFAULT_NFT_API === 'Alchemy') {
        tokenData = await retryOnGetNFTMetadata(contractAddress, tokenId, tokenType);
    } else {
        tokenData = await retryOnOpenseaNftApi(tokenId, contractAddress);
    }

    return tokenData;
};

const getContractData = async (contractAddress: string) => {
    let contractData;

    if (DEFAULT_NFT_API === 'Alchemy') {
        contractData = await retryOnGetContractMetadata(contractAddress);
    } else {
        contractData = await retryOnGetAssetContract(contractAddress);
    }

    return contractData;
};

const shortenAddress = (address: string) => {
    if (!ethers.utils.isAddress(address)) {
        throw new Error('Not a valid address');
    }
    return address.substring(0, 6) + '...' + address.substring(address.length - 4);
};

const getEthUsdPrice = async (ethPrice: number) => {
    const url = `
        https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${ETHERSCAN_API_KEY}
    `;
    const result = await retry(
        async () => {
            const response = await axios.get(url);
            const result = _.get(response, ['data', 'result']);
            const ethusd = _.get(result, 'ethusd');
            const usdPrice = (ethPrice * ethusd).toFixed(2);

            if (!response || !result || !ethusd || !usdPrice) {
                throw new Error('Might hitting rate limit, try again');
            }

            return parseFloat(usdPrice).toLocaleString('en-US');
        },
        {
            retries: 5
        }
    );

    return result;
};

const formatPrice = (price: number) => {
    let formatedPrice = price.toLocaleString('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    });
    const lastChar = formatedPrice.length - 1;

    formatedPrice = formatedPrice[lastChar] === '0' ? formatedPrice.slice(0, -1) : formatedPrice;
    return formatedPrice;
};

export {
    getENSName,
    formatPrice,
    getTokenData,
    shortenAddress,
    getEthUsdPrice,
    getOpenseaName,
    getContractData,
    getReadableName
};
