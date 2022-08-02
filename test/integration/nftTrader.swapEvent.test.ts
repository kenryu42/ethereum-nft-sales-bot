import assert from 'assert';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { getContractData } from '../../src/utils/api.js';
import { parseTransaction } from '../../src/controllers/parseTransaction.js';

describe('NFT Trader Integration Test', function () {
    describe('ERC721 swap event', function () {
        const bayc = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';

        it('should get the correct data', async function () {
            const txHash = '0x09fc308002fcad5f30e103cc582c60ab43fec67f6bd9357c347de63bbd7fc00a';
            const contractData = await getContractData(bayc);
            const tx = await parseTransaction(txHash, bayc, contractData);

            if (!tx || !tx.addressMaker || !tx.addressTaker) return;

            const makerReceivedAssets = tx.swap[tx.addressMaker].receivedAssets;
            const takerReceivedAssets = tx.swap[tx.addressTaker].receivedAssets;
            const makerReceivedEth = tx.swap[tx.addressMaker].receivedAmount;
            const takerReceivedEth = tx.swap[tx.addressTaker].receivedAmount;
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

            expect(tx.isSwap).to.be.true;
            expect(tx.swap[tx.addressMaker].name).to.exist;
            expect(tx.swap[tx.addressTaker].name).to.exist;
            expect(ethers.utils.isAddress(tx.addressMaker)).to.be.true;
            expect(ethers.utils.isAddress(tx.addressTaker)).to.be.true;
            assert.strictEqual(makerReceivedEth, '15.52');
            assert.strictEqual(takerReceivedEth, '0.0');
            assert.strictEqual(tx.market.name, 'NFT Trader 🔄');
            assert.strictEqual(tx.transactionHash, txHash);
            expect(tx.tokenData).to.not.be.null;
        });
    });

    describe('ERC1155 swap event', function () {
        const gutterCat = '0xedb61f74b0d09b2558f1eeb79b247c1f363ae452';

        it('should get the correct data', async function () {
            const txHash = '0x4faa22dac2533657dc2c08422c91abc389107a1bb1e88ceda4e72844ea2cec07';
            const contractData = await getContractData(gutterCat);
            const tx = await parseTransaction(txHash, gutterCat, contractData);

            if (!tx || !tx.addressMaker || !tx.addressTaker) return;

            const makerReceivedAssets = tx.swap[tx.addressMaker].receivedAssets;
            const takerReceivedAssets = tx.swap[tx.addressTaker].receivedAssets;
            const makerReceivedEth = tx.swap[tx.addressMaker].receivedAmount;
            const takerReceivedEth = tx.swap[tx.addressTaker].receivedAmount;
            const oneIds = ['1590'];
            const oneQuantities = [1];
            const twoIds = ['1715'];
            const twoQuantities = [1];

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

            expect(tx.isSwap).to.be.true;
            expect(tx.swap[tx.addressMaker].name).to.exist;
            expect(tx.swap[tx.addressTaker].name).to.exist;
            expect(ethers.utils.isAddress(tx.addressMaker)).to.be.true;
            expect(ethers.utils.isAddress(tx.addressTaker)).to.be.true;
            assert.strictEqual(makerReceivedEth, '0.4725');
            assert.strictEqual(takerReceivedEth, '0.0');
            assert.strictEqual(tx.market.name, 'NFT Trader 🔄');
            assert.strictEqual(tx.transactionHash, txHash);
            expect(tx.tokenData).to.not.be.null;
        });
    });

    describe('ERC721 & ERC1155 swap event', function () {
        const gutterCat = '0xedb61f74b0d09b2558f1eeb79b247c1f363ae452';

        it('should get the correct data', async function () {
            const txHash = '0xf31708233d600e253e1fffe4c5f82dadd5ce1acc47d823082fca00f7f1aa763d';
            const contractData = await getContractData(gutterCat);
            const tx = await parseTransaction(txHash, gutterCat, contractData);

            if (!tx || !tx.addressMaker || !tx.addressTaker) return;

            const makerReceivedAssets = tx.swap[tx.addressMaker].receivedAssets;
            const takerReceivedAssets = tx.swap[tx.addressTaker].receivedAssets;
            const makerReceivedEth = tx.swap[tx.addressMaker].receivedAmount;
            const takerReceivedEth = tx.swap[tx.addressTaker].receivedAmount;
            const oneIds = ['2636', '1899', '1719', '754', '222', '2174'];
            const oneTokenTypes = ['ERC721', 'ERC721', 'ERC721', 'ERC721', 'ERC721', 'ERC1155'];
            const oneQuantities = [undefined, undefined, undefined, undefined, undefined, 1];
            const twoIds = ['1590', '2632'];
            const twoTokenTypes = ['ERC1155', 'ERC1155'];
            const twoQuantities = [1, 1];

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

            expect(tx.isSwap).to.be.true;
            expect(tx.swap[tx.addressMaker].name).to.exist;
            expect(tx.swap[tx.addressTaker].name).to.exist;
            expect(ethers.utils.isAddress(tx.addressMaker)).to.be.true;
            expect(ethers.utils.isAddress(tx.addressTaker)).to.be.true;
            assert.strictEqual(makerReceivedEth, '0.0');
            assert.strictEqual(takerReceivedEth, '0.0');
            assert.strictEqual(tx.market.name, 'NFT Trader 🔄');
            assert.strictEqual(tx.transactionHash, txHash);
            expect(tx.tokenData).to.not.be.null;
        });
    });
});
