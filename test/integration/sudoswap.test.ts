import 'dotenv/config';
import assert from 'assert';
import { ethers } from 'ethers';
import { expect } from 'chai';
import { formatPrice } from '../../src/utils/helper.js';
import { Auth, ENFT } from '../../src/index.js';

describe('Sudoswap Integration Test', function () {
    const auth = new Auth({
        alchemy: {
            apiKey: process.env.ALCHEMY_API_KEY ?? ''
        }
    });
    const client = new ENFT(auth);

    describe('robustSwapNFTsForToken', function () {
        it('should get the correct data', async function () {
            const azuki = '0xed5af388653567af2f388e6224dc7c4b3241c544';
            const txHash =
                '0xeabd9c5bd55f118b058be411b811e10e3803242824593441e7e83715aee17a44';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: azuki
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['4152', '4214', '7009'];

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            expect(tokenIds).to.have.members(tokenIdsTruth);
            assert.strictEqual(tx.contractData.tokenType, 'ERC721');
            assert.strictEqual(
                tx.toAddr,
                '0x77D20F43B5aeB69a533E2E8A64020491D3e3d198'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '18.7654');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 3);
            assert.strictEqual(tx.contractAddress, azuki);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'sudoswap');
        });
    });

    describe('swapNFTsForToken', function () {
        it('should get the correct data', async function () {
            const azuki = '0xed5af388653567af2f388e6224dc7c4b3241c544';
            const txHash =
                '0x0fe66bc9019697377dc4cff67d4bf5886a9a6197315b6af8729d9de0bbc97f4c';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: azuki
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;

            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['9762'];

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.not.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            expect(tokenIds).to.have.members(tokenIdsTruth);
            assert.strictEqual(tx.contractData.tokenType, 'ERC721');
            assert.strictEqual(
                tx.fromAddr,
                '0x4900e97E434B4794165cd9c8286d75ee6056CAbC'
            );
            assert.strictEqual(
                tx.toAddr,
                '0x63E48552798d84376b294b83726095d53178a814'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '5.8273');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, azuki);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'sudoswap');
        });
    });

    describe('swapETHForSpecificNFTs', function () {
        it('should get the correct data', async function () {
            const azuki = '0xed5af388653567af2f388e6224dc7c4b3241c544';
            const txHash =
                '0x6ed9b222a6ff0e0d5561e6c15fea19537d8f03ca0a493535490269ab816992a5';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: azuki
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;

            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['1069'];

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.not.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            expect(tokenIds).to.have.members(tokenIdsTruth);
            assert.strictEqual(tx.contractData.tokenType, 'ERC721');
            assert.strictEqual(
                tx.fromAddr,
                '0xb9d383dd52DcBDf2bE24121071F18A8Bd56b81Fe'
            );
            assert.strictEqual(
                tx.toAddr,
                '0xAE2D81E7a8107578D6dbd7cf7E4692E3fEbb0dba'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '7');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, azuki);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'sudoswap');
        });
    });

    describe('robustSwapETHForSpecificNFTs', function () {
        it('should get the correct data', async function () {
            const wiiides = '0x72a94e6c51cb06453b84c049ce1e1312f7c05e2c';
            const txHash =
                '0x98694c9db3066a0831a5d5438e965eb58f34ea197d6ded3dc070d592d2fd0967';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: wiiides
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;

            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = [
                '1249',
                '1489',
                '1758',
                '1761',
                '2403',
                '2488',
                '2737',
                '4643',
                '4764',
                '5529',
                '5704',
                '5990',
                '6319',
                '6781',
                '6899',
                '8093',
                '8338',
                '8661',
                '8690',
                '8897',
                '9120',
                '9143',
                '9502',
                '9638',
                '9855',
                '9930',
                '9940'
            ];

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            expect(tokenIds).to.have.members(tokenIdsTruth);
            assert.strictEqual(tx.contractData.tokenType, 'ERC721');
            assert.strictEqual(
                tx.toAddr,
                '0x899CD70aD8f1b9bdFc9A179E7f6dcab6F9CaAB41'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '0.2671');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 27);
            assert.strictEqual(tx.contractAddress, wiiides);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'sudoswap');
        });
    });
});
