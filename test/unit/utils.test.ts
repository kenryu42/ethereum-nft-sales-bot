import assert from 'assert';
import { expect } from 'chai';
import {
    shortenAddress,
    getENSName,
    getOpenseaName,
    getReadableName,
    getEthUsdPrice,
    getTokenData,
    getContractData,
    formatPrice
} from '../../src/utils/api.js';
import { DEFAULT_NFT_API } from '../../src/config/setup.js';
import { NftTokenType } from 'alchemy-sdk';

describe('Unit Test', function () {
    const myAddress = '0xBbf61c7c7eaF83a697f69A02469B4F7D2fCc2936';
    const validAddress = '0x1234567890123456789012345678901234567890';
    const invalidAddress = '0x123456789012345678901234567890123456789';

    console.log(`Default NFT Api: ${DEFAULT_NFT_API}`);

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
            expect(() => shortenAddress(invalidAddress)).to.throw('Not a valid address');
        });
    });

    describe('get ENS name', function () {
        it('should able to get ENS name', async function () {
            const ensName = await getENSName(myAddress);

            assert.strictEqual(ensName, 'kenryu.eth');
        });
    });

    describe('get Opensea account name', function () {
        it('should able to get Opensea name', async function () {
            const ensName = await getOpenseaName(myAddress);

            assert.strictEqual(ensName, 'kenryu42');
        });
    });

    describe('get readable name', function () {
        it('should try to get readable name else shorten the address', async function () {
            const account_1 = await getReadableName(myAddress);
            const account_2 = await getReadableName('0xDbc3C7CE58eAb6Cbf9638A11d9Db36FD880175Ff');
            const account_3 = await getReadableName(validAddress);

            assert.strictEqual(account_1, 'kenryu42');
            assert.strictEqual(account_2, 'ipaperhand.eth');
            assert.strictEqual(account_3, '0x1234...7890');
        });
    });

    describe('get Eth Usd price', function () {
        it('should return ethusd price', async function () {
            const ethUsd = await getEthUsdPrice(0.69);
            const result = isNumeric(ethUsd);

            expect(result).to.be.true;
        });
    });

    describe('get token data', function () {
        const azuki = '0xED5AF388653567Af2F388E6224dC7C4b3241C544';
        it('should able to get token data', async function () {
            const tokenData = await getTokenData(azuki, 40, 'ERC721' as NftTokenType);
            const image = tokenData.image;
            const tokenName = tokenData.name;

            expect(tokenData).to.not.be.null;
            expect(image).to.not.be.null;
            assert.strictEqual(tokenName, 'Azuki #40');
        });
    });

    describe('get contract data', function () {
        const azuki = '0xED5AF388653567Af2F388E6224dC7C4b3241C544';
        it('should able to get token data', async function () {
            const contractData = await getContractData(azuki);
            const symbol = contractData.symbol;
            const collectionName = contractData.name;

            expect(contractData).to.not.be.null;
            expect(contractData).to.not.be.undefined;
            assert.strictEqual(symbol, 'AZUKI');
            assert.strictEqual(collectionName, 'Azuki');
        });
    });

    describe('format price to 3 or 4 decimal', function () {
        it('should return price with 3 decimal', function () {
            const priceOne = formatPrice(1);
            const priceTwo = formatPrice(0.69000001);
            const priceThree = formatPrice(0.699999999999999);

            assert.strictEqual(priceOne, '1.000');
            assert.strictEqual(priceTwo, '0.690');
            assert.strictEqual(priceThree, '0.700');
        });

        it('should return price with 4 decimal', function () {
            const priceOne = formatPrice(0.42444445);
            const priceTwo = formatPrice(0.611999999999999);
            const priceThree = formatPrice(15000000.12499);

            assert.strictEqual(priceOne, '0.4244');
            assert.strictEqual(priceTwo, '0.612');
            assert.strictEqual(priceThree, '15,000,000.125');
        });
    });
});
