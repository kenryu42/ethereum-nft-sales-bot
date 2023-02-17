import 'dotenv/config';
import assert from 'assert';
import { expect } from 'chai';
import {
    getENSName,
    shortenAddress,
    getOpenseaName,
    getReadableName,
    getEthUsdPrice,
    getNftMetadata,
    getContractMetadata
} from '../../src/api/api.js';
import { formatPrice } from '../../src/utils/helper.js';
import { Auth } from '../../src/Auth/Auth.js';

describe('Unit Test', function () {
    const myAddress = '0xBbf61c7c7eaF83a697f69A02469B4F7D2fCc2936';
    const validAddress = '0x1234567890123456789012345678901234567890';
    const invalidAddress = '0x123456789012345678901234567890123456789';

    if (!process.env.ALCHEMY_API_KEY || !process.env.ETHERSCAN_API_KEY) {
        throw new Error('Missing env variables');
    }

    const auth = new Auth({
        alchemy: {
            apiKey: process.env.ALCHEMY_API_KEY
        }
    });

    /*
     **	https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
     */
    function isNumeric(str: string) {
        return !Number.isNaN(str) && !Number.isNaN(parseFloat(str));
    }

    describe('shorten address', function () {
        it('should shorten the address', function () {
            const shortAddr = shortenAddress(validAddress);

            assert.strictEqual(shortAddr, '0x1234...7890');
        });
        it('should throw error for invalid address', function () {
            expect(() => shortenAddress(invalidAddress)).to.throw();
        });
    });

    describe('get ENS name (API)', function () {
        it('should able to get ENS name', async function () {
            const ensName = await getENSName(myAddress, auth.getProvider());

            assert.strictEqual(ensName, 'kenryu.eth');
        });
    });

    describe('get Opensea account name (API)', function () {
        it('should able to get Opensea name', async function () {
            const ensName = await getOpenseaName(myAddress);

            assert.strictEqual(ensName, 'kenryu42');
        });
    });

    describe('get readable name (API)', function () {
        it('should try to get readable name else shorten the address', async function () {
            const account_1 = await getReadableName(
                myAddress,
                auth.getProvider()
            );
            const account_2 = await getReadableName(
                '0xDbc3C7CE58eAb6Cbf9638A11d9Db36FD880175Ff',
                auth.getProvider()
            );
            const account_3 = await getReadableName(
                validAddress,
                auth.getProvider()
            );

            assert.strictEqual(account_1, 'kenryu42');
            assert.strictEqual(account_2, 'ipaperhand.eth');
            assert.strictEqual(account_3, '0x1234...7890');
        });
    });

    describe('get Eth Usd price (API)', function () {
        it('should return ethusd price', async function () {
            const etherscanApiKey = process.env.ETHERSCAN_API_KEY || '';

            if (etherscanApiKey) {
                const ethUsd = await getEthUsdPrice(0.69, etherscanApiKey);
                const result = isNumeric(ethUsd);

                expect(result).to.be.true;
            }
        });
    });

    describe('get token data (API)', function () {
        const azuki = '0xED5AF388653567Af2F388E6224dC7C4b3241C544';
        it('should able to get token data', async function () {
            const tokenData = await getNftMetadata(
                azuki,
                '40',
                auth.getApiAuth()
            );
            const image = tokenData?.image;
            const tokenName = tokenData?.name;

            expect(tokenData).to.not.be.null;
            expect(image).to.not.be.null;
            assert.strictEqual(tokenName, 'Azuki #40');
        });
    });

    describe('get contract data (API)', function () {
        const azuki = '0xED5AF388653567Af2F388E6224dC7C4b3241C544';
        it('should able to get token data', async function () {
            const contractData = await getContractMetadata(
                azuki,
                auth.getApiAuth()
            );
            const symbol = contractData?.symbol;
            const collectionName = contractData?.name;

            expect(contractData).to.not.be.null;
            expect(contractData).to.not.be.undefined;
            assert.strictEqual(symbol, 'AZUKI');
            assert.strictEqual(collectionName, 'Azuki');
        });
    });

    describe('format price decimals', function () {
        it('should return price with correct decimals', function () {
            const priceOne = formatPrice(1);
            const priceTwo = formatPrice(0.69000001);
            const priceThree = formatPrice(0.699999999999999);
            const priceFour = formatPrice(0.42444445);
            const priceFive = formatPrice(0.611999999999999);
            const priceSix = formatPrice(15000000.12499);

            assert.strictEqual(priceOne, '1');
            assert.strictEqual(priceTwo, '0.69');
            assert.strictEqual(priceThree, '0.7');
            assert.strictEqual(priceFour, '0.4244');
            assert.strictEqual(priceFive, '0.612');
            assert.strictEqual(priceSix, '15,000,000.125');
        });
    });
});
