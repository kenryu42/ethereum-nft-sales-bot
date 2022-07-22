import assert from 'assert';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { WEB3 } from '../../config/setup.js';
import { parseTransaction } from '../../controllers/parseTransaction.js';

describe('NFT Trader Integration Test', function () {
    after(function () {
        WEB3.currentProvider.disconnect();
    });

    describe('ERC721 swap event', function () {
        const bayc = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';

        it('should get the correct data', async function () {
            const txHash = '0x09fc308002fcad5f30e103cc582c60ab43fec67f6bd9357c347de63bbd7fc00a';
            const parseResult = await parseTransaction(WEB3, txHash, bayc, 'ERC721');
            const { isSwap, swap, addressMaker, addressTaker, tokenData, market, transactionHash } =
                parseResult;
            const makerReceivedAssets = swap[addressMaker].receivedAssets;
            const takerReceivedAssets = swap[addressTaker].receivedAssets;
            const makerReceivedEth = swap[addressMaker].receivedAmount;
            const takerReceivedEth = swap[addressTaker].receivedAmount;
            const oneIds = ['8297', '4315', '85317'];
            const twoIds = ['3429'];

            for (let i = 0; i < makerReceivedAssets.length; i++) {
                assert.strictEqual(makerReceivedAssets[i].tokenId, oneIds[i]);
                assert.strictEqual(makerReceivedAssets[i].tokenType, 'ERC721');
                expect(makerReceivedAssets[i].contractAddress).to.exist;
            }

            for (let i = 0; i < takerReceivedAssets.length; i++) {
                assert.strictEqual(takerReceivedAssets[i].tokenId, twoIds[i]);
                assert.strictEqual(takerReceivedAssets[i].tokenType, 'ERC721');
                expect(takerReceivedAssets[i].contractAddress).to.exist;
            }

            expect(isSwap).to.be.true;
            expect(swap[addressMaker].name).to.exist;
            expect(swap[addressTaker].name).to.exist;
            expect(ethers.utils.isAddress(addressMaker)).to.be.true;
            expect(ethers.utils.isAddress(addressTaker)).to.be.true;
            assert.strictEqual(makerReceivedEth, '15.52');
            assert.strictEqual(takerReceivedEth, '0.0');
            assert.strictEqual(market.name, 'NFT Trader 🔄');
            assert.strictEqual(transactionHash, txHash);
            assert.strictEqual(tokenData.status, 200);
        });
    });

    describe('ERC1155 swap event', function () {
        const gutterCat = '0xedb61f74b0d09b2558f1eeb79b247c1f363ae452';

        it('should get the correct data', async function () {
            const txHash = '0x4faa22dac2533657dc2c08422c91abc389107a1bb1e88ceda4e72844ea2cec07';
            const parseResult = await parseTransaction(WEB3, txHash, gutterCat, 'ERC1155');
            const { isSwap, swap, addressMaker, addressTaker, tokenData, market, transactionHash } =
                parseResult;
            const makerReceivedAssets = swap[addressMaker].receivedAssets;
            const takerReceivedAssets = swap[addressTaker].receivedAssets;
            const makerReceivedEth = swap[addressMaker].receivedAmount;
            const takerReceivedEth = swap[addressTaker].receivedAmount;
            const oneIds = ['1590'];
            const oneQuantities = ['1'];
            const twoIds = ['1715'];
            const twoQuantities = ['1'];

            for (let i = 0; i < makerReceivedAssets.length; i++) {
                assert.strictEqual(makerReceivedAssets[i].tokenId, oneIds[i]);
                assert.strictEqual(makerReceivedAssets[i].tokenType, 'ERC1155');
                assert.strictEqual(makerReceivedAssets[i].quantity, oneQuantities[i]);
                expect(makerReceivedAssets[i].contractAddress).to.exist;
            }

            for (let i = 0; i < takerReceivedAssets.length; i++) {
                assert.strictEqual(takerReceivedAssets[i].tokenId, twoIds[i]);
                assert.strictEqual(takerReceivedAssets[i].tokenType, 'ERC1155');
                assert.strictEqual(takerReceivedAssets[i].quantity, twoQuantities[i]);
                expect(takerReceivedAssets[i].contractAddress).to.exist;
            }

            expect(isSwap).to.be.true;
            expect(swap[addressMaker].name).to.exist;
            expect(swap[addressTaker].name).to.exist;
            expect(ethers.utils.isAddress(addressMaker)).to.be.true;
            expect(ethers.utils.isAddress(addressTaker)).to.be.true;
            assert.strictEqual(makerReceivedEth, '0.4725');
            assert.strictEqual(takerReceivedEth, '0.0');
            assert.strictEqual(market.name, 'NFT Trader 🔄');
            assert.strictEqual(transactionHash, txHash);
            assert.strictEqual(tokenData.status, 200);
        });
    });

    /*
    describe('ERC721 & ERC1155 swap event', function () {
        const mayc = '0x60e4d786628fea6478f785a6d7e704777c86a7c6';

        it('should get the correct data', async function () {
            const txHash = '0xa4053393f2897162b9c7de76e8dac711a159d70393318e4a41ac7b070ce60ec3';
            const parseResult = await parseTransaction(WEB3, txHash, mayc, token_type);
            const { isSwap, swap, addressMaker, addressTaker, tokenData, market, transactionHash } =
                parseResult;
            const makerReceivedAssets = swap[addressMaker].receivedAssets;
            const takerReceivedAssets = swap[addressTaker].receivedAssets;
            const makerReceivedEth = swap[addressMaker].receivedAmount;
            const takerReceivedEth = swap[addressTaker].receivedAmount;
            const oneIds = ['16510'];
            const oneTokenTypes = ['ERC721'];
            const oneQuantities = [];
            const twoIds = ['1'];
            const twoTokenTypes = ['ERC1155'];
            const twoQuantities = ['4'];

            for (let i = 0; i < makerReceivedAssets.length; i++) {
                assert.strictEqual(makerReceivedAssets[i].tokenId, oneIds[i]);
                assert.strictEqual(makerReceivedAssets[i].tokenType, oneTokenTypes[i]);
                assert.strictEqual(makerReceivedAssets[i].quantity, oneQuantities[i]);
                expect(makerReceivedAssets[i].contractAddress).to.exist;
            }

            for (let i = 0; i < takerReceivedAssets.length; i++) {
                assert.strictEqual(takerReceivedAssets[i].tokenId, twoIds[i]);
                assert.strictEqual(takerReceivedAssets[i].tokenType, twoTokenTypes[i]);
                assert.strictEqual(takerReceivedAssets[i].quantity, twoQuantities[i]);
                expect(takerReceivedAssets[i].contractAddress).to.exist;
            }

            expect(isSwap).to.be.true;
            expect(swap[addressMaker].name).to.exist;
            expect(swap[addressTaker].name).to.exist;
            expect(ethers.utils.isAddress(addressMaker)).to.be.true;
            expect(ethers.utils.isAddress(addressTaker)).to.be.true;
            assert.strictEqual(makerReceivedEth, '0.0');
            assert.strictEqual(takerReceivedEth, '3.0');
            assert.strictEqual(market.name, 'NFT Trader 🔄');
            assert.strictEqual(transactionHash, txHash);
            assert.strictEqual(tokenData.status, 200);
        });
    });
    */
});
