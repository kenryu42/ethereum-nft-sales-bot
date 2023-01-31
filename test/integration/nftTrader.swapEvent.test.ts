import assert from 'assert';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { getContractData } from '../../src/utils/api.js';
import { parseTransaction } from '../../src/controllers/parseTransaction.js';

// Todo
describe('NFT Trader Integration Test (Seaport Contract)', function () {
    describe('ERC721 swap event', function () {
        it('should get the correct sales data', async function () {
            const azuki = '0xed5af388653567af2f388e6224dc7c4b3241c544';
            const contractData = await getContractData(azuki);
            const txHash = '0x5889d55dbd945fd21f7f55813a2924d7b8cf7361c738c53c43390d22fe6da1b4';
            const tx = await parseTransaction(txHash, azuki, contractData);

            if (!tx || !tx.swap.maker.address || !tx.swap.taker.address) return;

            const makerSpentAssets = tx.swap.maker.spentAssets;
            const takerSpentAssets = tx.swap.taker.spentAssets;
            const makerSpentAmount = tx.swap.maker.spentAmount;
            const takerSpentAmount = tx.swap.taker.spentAmount;
            const makerTokenIds = ['7726'];
            const takerTokenIds = ['522', '3710'];

            for (let i = 0; i < makerSpentAssets.length; i++) {
                assert.strictEqual(makerSpentAssets[i].tokenId, makerTokenIds[i]);
                assert.strictEqual(makerSpentAssets[i].tokenType, 'ERC721');
                expect(makerSpentAssets[i].contractAddress).to.exist;
            }

            for (let i = 0; i < takerSpentAssets.length; i++) {
                assert.strictEqual(takerSpentAssets[i].tokenId, takerTokenIds[i]);
                assert.strictEqual(takerSpentAssets[i].tokenType, 'ERC721');
                expect(takerSpentAssets[i].contractAddress).to.exist;
            }

            expect(tx.swap.maker.name).to.exist;
            expect(tx.swap.taker.name).to.exist;
            expect(ethers.utils.isAddress(tx.swap.maker.address)).to.be.true;
            expect(ethers.utils.isAddress(tx.swap.taker.address)).to.be.true;
            assert.strictEqual(makerSpentAmount, '0');
            assert.strictEqual(takerSpentAmount, '0.2');
            assert.strictEqual(tx.transactionHash, txHash);
        });
    });

    describe('ERC1155 swap event', function () {
        expect(true).to.be.true;
    });

    describe('ERC721 & ERC1155 swap event', function () {
        expect(true).to.be.true;
    });
});
