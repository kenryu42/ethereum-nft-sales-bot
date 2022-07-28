import 'dotenv/config';
import _ from 'lodash';
import axios from 'axios';
import { ethers } from 'ethers';
import retry from 'async-retry';
import {
    DEFAULT_NFT_API,
    OPENSEA_API_KEY,
    ALCHEMY_API_KEY,
    ETHERSCAN_API_KEY
} from '../config/setup';
import { AlchemyWeb3 } from '@alch/alchemy-web3';
import { ContractData, TokenData } from '../types/types';

const openseaNftApi = async (tokenId: string | number, contractAddress: string) => {
    const baseURL = `https://api.opensea.io/api/v1/asset/${contractAddress}/${tokenId}`;

    try {
        const response = await axios.get(baseURL, {
            headers: {
                'X-API-KEY': OPENSEA_API_KEY
            }
        });

        return response;
    } catch (error: any) {
        if (error.response) {
            console.log(error.response.data);
            console.log(error.response.status);
        } else {
            console.error(error.message);
        }

        return null;
    }
};

const retryOnOpenseaNftApi = async (
    tokenId: string | number,
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
    } catch (error: any) {
        console.log('getOpenseaName API error');
        console.log(`address: ${address}`);
        if (error.response) {
            console.log('Error message:', error.response.data);
            console.log('Status:', error.response.status);
        } else {
            console.error(error.message);
        }
    }
};

const getNFTMetadata = async (
    contractAddress: string,
    tokenType: string,
    tokenId: string | number
) => {
    try {
        const baseURL = `https://eth-mainnet.alchemyapi.io/nft/v2/${ALCHEMY_API_KEY}/getNFTMetadata`;
        const response = await axios.get(
            `${baseURL}?contractAddress=${contractAddress}&tokenId=${tokenId}&tokenType=${tokenType}`
        );

        return response;
    } catch (error: any) {
        console.log('getNFTMetadata API error');

        if (error.response) {
            console.log('Error data:', error.response.data);
            console.log('Status:', error.response.status);
        } else {
            console.error('Error message:', error.message);
        }

        return null;
    }
};

const retryOnGetNFTMetadata = async (
    contractAddress: string,
    tokenType: string,
    tokenId: string | number
): Promise<TokenData> => {
    const result = await retry(
        async () => {
            const response = await getNFTMetadata(contractAddress, tokenType, tokenId);

            if (response === null) {
                throw new Error('Might hitting rate limit, try again');
            }

            const data = _.get(response, 'data');

            return {
                name: _.get(data, 'title'),
                image: _.get(data, 'media[0].gateway')
            };
        },
        {
            retries: 5
        }
    );

    return result;
};

const getContractMetadata = async (contractAddress: string) => {
    try {
        const response = await axios.get(
            `https://eth-mainnet.alchemyapi.io/nft/v2/${ALCHEMY_API_KEY}/getContractMetadata?contractAddress=${contractAddress}`
        );

        return response;
    } catch (error: any) {
        console.log('getContractMetadata API error');

        if (error.response) {
            console.log('Error data:', error.response.data);
            console.log('Status:', error.response.status);
        } else {
            console.error('Error message:', error.message);
        }

        return null;
    }
};

const retryOnGetContractMetadata = async (contractAddress: string): Promise<ContractData> => {
    const result = await retry(
        async () => {
            const response = await getContractMetadata(contractAddress);

            if (response === null) {
                throw new Error('Might hitting rate limit, try again');
            }

            const data = _.get(response, ['data', 'contractMetadata']);

            return {
                name: _.get(data, 'name'),
                symbol: _.get(data, 'symbol'),
                tokenType: _.get(data, 'tokenType').toUpperCase()
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
    } catch (error: any) {
        console.log('getAssetContract API error');

        if (error.response) {
            console.log('Error data:', error.response.data);
            console.log('Status:', error.response.status);
        } else {
            console.error('Error message:', error.message);
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
        (await getOpenseaName(address)) || (await getENSName(address)) || shortenAddress(address);

    return result;
};

const getTransactionReceipt = async (web3: AlchemyWeb3, transactionHash: string) => {
    const receipt = await retry(
        async () => {
            const rec = await web3.eth.getTransactionReceipt(transactionHash);

            if (rec == null) {
                throw new Error('receipt not found, try again');
            }

            return rec;
        },
        {
            retries: 3
        }
    );

    return receipt;
};

const getTokenData = async (
    contractAddress: string,
    tokenType: string,
    tokenId: string | number
) => {
    let tokenData;

    if (DEFAULT_NFT_API === 'Alchemy') {
        tokenData = await retryOnGetNFTMetadata(contractAddress, tokenType, tokenId);
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
    getNFTMetadata,
    getContractData,
    getReadableName,
    getContractMetadata,
    getTransactionReceipt
};
