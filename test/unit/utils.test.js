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
} from '../../utils/api.js';
import { WEB3 } from '../../config/setup.js';

describe('Unit Test', function () {
    const myAddress = '0xBbf61c7c7eaF83a697f69A02469B4F7D2fCc2936';
    const validAddress = '0x1234567890123456789012345678901234567890';
    const invalidAddress = '0x123456789012345678901234567890123456789';

    after(function () {
        WEB3.currentProvider.disconnect();
    });

    /*
     **	https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
     */
    function isNumeric(str) {
        if (typeof str != 'string') return false;
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
            const ethUsd = await getEthUsdPrice('0.69');
            const result = isNumeric(ethUsd);

            expect(result).to.be.true;
        });
    });

    describe('get token data', function () {
        const azuki = '0xED5AF388653567Af2F388E6224dC7C4b3241C544';
        it('should able to get token data', async function () {
            const tokenData = await getTokenData(42, azuki);
            const response = tokenData.status === 200;

            expect(response).to.be.true;
        });
    });

    describe('get contract data', function () {
        const azuki = '0xED5AF388653567Af2F388E6224dC7C4b3241C544';
        it('should able to get token data', async function () {
            const contractData = await getContractData(azuki);
            const contractName = contractData.name;

            expect(contractData).to.not.be.null;
            expect(contractData).to.not.be.undefined;
            expect(contractName).to.not.be.null;
            expect(contractData).to.not.be.undefined;
        });
    });

    describe('format price to 2 or 3 decimal', function () {
        it('should return price with 2 decimal', function () {
            const priceOne = formatPrice(1);
            const priceTwo = formatPrice(0.69000001);
            const priceThree = formatPrice(0.699999999999999);

            assert.strictEqual(priceOne, '1.00');
            assert.strictEqual(priceTwo, '0.69');
            assert.strictEqual(priceThree, '0.70');
        });

        it('should return price with 3 decimal', function () {
            const priceOne = formatPrice(0.42444445);
            const priceTwo = formatPrice(0.611999999999999);
            const priceThree = formatPrice(15000000.12499);

            assert.strictEqual(priceOne, '0.424');
            assert.strictEqual(priceTwo, '0.612');
            assert.strictEqual(priceThree, '15,000,000.125');
        });
    });
});
