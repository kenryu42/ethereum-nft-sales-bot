import 'dotenv/config';
import assert from 'assert';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { Auth, ENFT } from '../../src/index.js';

describe('NFT Trader Integration Test (Seaport Contract)', function () {
    const auth = new Auth({
        alchemy: {
            apiKey: process.env.ALCHEMY_API_KEY ?? ''
        }
    });
    const client = new ENFT(auth);

    describe('ERC721 swap event', function () {
        it('should get the correct sales data', async function () {
            const azuki = '0xed5af388653567af2f388e6224dc7c4b3241c544';
            const txHash =
                '0x5889d55dbd945fd21f7f55813a2924d7b8cf7361c738c53c43390d22fe6da1b4';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: azuki
            });

            if (!tx || !tx.swap?.maker.address || !tx.swap.taker.address)
                return;

            const makerSpentAssets = tx.swap.maker.spentAssets;
            const takerSpentAssets = tx.swap.taker.spentAssets;
            const makerSpentAmount = tx.swap.maker.spentAmount;
            const takerSpentAmount = tx.swap.taker.spentAmount;
            const makerTokenIds = ['7726'];
            const takerTokenIds = ['522', '3710'];

            for (let i = 0; i < makerSpentAssets.length; i++) {
                assert.strictEqual(
                    makerSpentAssets[i].tokenId,
                    makerTokenIds[i]
                );
                assert.strictEqual(makerSpentAssets[i].tokenType, 'ERC721');
                expect(makerSpentAssets[i].contractAddress).to.exist;
            }

            for (let i = 0; i < takerSpentAssets.length; i++) {
                assert.strictEqual(
                    takerSpentAssets[i].tokenId,
                    takerTokenIds[i]
                );
                assert.strictEqual(takerSpentAssets[i].tokenType, 'ERC721');
                expect(takerSpentAssets[i].contractAddress).to.exist;
            }

            expect(tx.swap.maker.name).to.exist;
            expect(tx.swap.taker.name).to.exist;
            expect(ethers.isAddress(tx.swap.maker.address)).to.be.true;
            expect(ethers.isAddress(tx.swap.taker.address)).to.be.true;
            assert.strictEqual(makerSpentAmount, '0');
            assert.strictEqual(takerSpentAmount, '0.2');
            assert.strictEqual(tx.transactionHash, txHash);
        });
    });

    // Todo
    describe('ERC1155 swap event', function () {
        it('should get the correct sales data', async function () {
            const valhallaReserve =
                '0xd1B68763C7170B963Ac6cA6B1C2EA25796A18a17';
            const txHash =
                '0x4b3a20091c780e4626019ee760056cf5e1110ceec6c1a5633228d29e0cb707ec';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: valhallaReserve
            });

            if (!tx || !tx.swap?.maker.address || !tx.swap.taker.address)
                return;

            const makerSpentAssets = tx.swap.maker.spentAssets;
            const takerSpentAssets = tx.swap.taker.spentAssets;
            const makerSpentAmount = tx.swap.maker.spentAmount;
            const takerSpentAmount = tx.swap.taker.spentAmount;
            const makerTokenIds = ['1'];
            const makerTokenTypes = ['ERC1155'];
            const takerTokenIds: string[] = [];
            const takerTokenTypes: string[] = [];

            for (let i = 0; i < makerSpentAssets.length; i++) {
                assert.strictEqual(
                    makerSpentAssets[i].tokenId,
                    makerTokenIds[i]
                );
                assert.strictEqual(
                    makerSpentAssets[i].tokenType,
                    makerTokenTypes[i]
                );
                assert.strictEqual(makerSpentAssets[i].amount, 50);
                expect(makerSpentAssets[i].contractAddress).to.exist;
            }

            for (let i = 0; i < takerSpentAssets.length; i++) {
                assert.strictEqual(
                    takerSpentAssets[i].tokenId,
                    takerTokenIds[i]
                );
                assert.strictEqual(
                    takerSpentAssets[i].tokenType,
                    takerTokenTypes[i]
                );
                expect(takerSpentAssets[i].contractAddress).to.exist;
            }

            expect(tx.swap.maker.name).to.exist;
            expect(tx.swap.taker.name).to.exist;
            expect(ethers.isAddress(tx.swap.maker.address)).to.be.true;
            expect(ethers.isAddress(tx.swap.taker.address)).to.be.true;
            assert.strictEqual(makerSpentAmount, '0');
            assert.strictEqual(takerSpentAmount, '1.375');
            assert.strictEqual(tx.transactionHash, txHash);
        });
    });

    describe('ERC721 & ERC1155 swap event', function () {
        it('should get the correct sales data', async function () {
            const killaGear = '0x153f8df0ce6a014e21f6fe6825129c53fa6ce0d8';
            const txHash =
                '0xb284d9788c531afa9bceb5e4ad51e3e829ccc1de1b461ebe3823e5c1861b3595';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: killaGear
            });

            if (!tx || !tx.swap?.maker.address || !tx.swap.taker.address)
                return;

            const makerSpentAssets = tx.swap.maker.spentAssets;
            const takerSpentAssets = tx.swap.taker.spentAssets;
            const makerSpentAmount = tx.swap.maker.spentAmount;
            const takerSpentAmount = tx.swap.taker.spentAmount;
            const makerTokenIds = ['1971', '804', '179', '180', '181', '182'];
            const makerTokenTypes = [
                'ERC721',
                'ERC721',
                'ERC1155',
                'ERC1155',
                'ERC1155',
                'ERC1155'
            ];
            const takerTokenIds: string[] = [];
            const takerTokenTypes: string[] = [];

            for (let i = 0; i < makerSpentAssets.length; i++) {
                assert.strictEqual(
                    makerSpentAssets[i].tokenId,
                    makerTokenIds[i]
                );
                assert.strictEqual(
                    makerSpentAssets[i].tokenType,
                    makerTokenTypes[i]
                );
                expect(makerSpentAssets[i].contractAddress).to.exist;
            }

            for (let i = 0; i < takerSpentAssets.length; i++) {
                assert.strictEqual(
                    takerSpentAssets[i].tokenId,
                    takerTokenIds[i]
                );
                assert.strictEqual(
                    takerSpentAssets[i].tokenType,
                    takerTokenTypes[i]
                );
                expect(takerSpentAssets[i].contractAddress).to.exist;
            }

            expect(tx.swap.maker.name).to.exist;
            expect(tx.swap.taker.name).to.exist;
            expect(ethers.isAddress(tx.swap.maker.address)).to.be.true;
            expect(ethers.isAddress(tx.swap.taker.address)).to.be.true;
            assert.strictEqual(makerSpentAmount, '0');
            assert.strictEqual(takerSpentAmount, '7');
            assert.strictEqual(tx.transactionHash, txHash);
        });
    });
});
