import assert from 'assert';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { getContractData } from '../../src/utils/api.js';
import { parseTransaction } from '../../src/controllers/parseTransaction.js';

describe('Sudoswap Integration Test', function () {
    describe('robustSwapNFTsForToken', function () {
        const azuki = '0xed5af388653567af2f388e6224dc7c4b3241c544';

        it('should get the correct data', async function () {
            const txHash = '0xeabd9c5bd55f118b058be411b811e10e3803242824593441e7e83715aee17a44';
            const contractData = await getContractData(azuki);
            const tx = await parseTransaction(txHash, azuki, contractData);

            if (!tx) return;

            const isSameSize = tx.tokens.length === tx.quantity;

            assert.strictEqual(tx.isSweep,true);
            expect(isSameSize).to.be.true;
            expect(tx.isSudo).to.be.true;
            expect(tx.tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(tx.sweeperAddr ?? '')).to.be.true;
            assert.strictEqual(tx.market.name, 'Sudoswap');
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.totalPrice, 18.76539336261635);
        });
    });

    describe('swapNFTsForToken', function () {
        const azuki = '0xed5af388653567af2f388e6224dc7c4b3241c544';

        it('should get the correct data', async function () {
            const txHash = '0x0fe66bc9019697377dc4cff67d4bf5886a9a6197315b6af8729d9de0bbc97f4c';
            const contractData = await getContractData(azuki);
            const tx = await parseTransaction(txHash, azuki, contractData);

            if (!tx) return;

            const isSameSize = tx.tokens.length === tx.quantity;

            assert.strictEqual(tx.isSweep,false);
            expect(isSameSize).to.be.true;
            expect(tx.isSudo).to.be.true;
            expect(tx.tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(tx.sweeperAddr ?? '')).to.be.true;
            assert.strictEqual(tx.market.name, 'Sudoswap');
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.totalPrice, 5.8272946859903385);
        });
    });

    describe('swapETHForSpecificNFTs', function () {
        const azuki = '0xed5af388653567af2f388e6224dc7c4b3241c544';

        it('should get the correct data', async function () {
            const txHash = '0x6ed9b222a6ff0e0d5561e6c15fea19537d8f03ca0a493535490269ab816992a5';
            const contractData = await getContractData(azuki);
            const tx = await parseTransaction(txHash, azuki, contractData);

            if (!tx) return;

            const isSameSize = tx.tokens.length === tx.quantity;

            assert.strictEqual(tx.isSweep,false);
            expect(isSameSize).to.be.true;
            expect(tx.isSudo).to.be.true;
            expect(tx.tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(tx.sweeperAddr ?? '')).to.be.true;
            assert.strictEqual(tx.market.name, 'Sudoswap');
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.totalPrice, 7.000000000000001);
        });
    });
});
