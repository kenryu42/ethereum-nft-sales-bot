import assert from 'assert';
import { expect } from 'chai';
import { ethers } from 'ethers';
import type { ContractData } from '../../src/types';
import { getContractData } from '../../src/utils/api.js';
import { parseTransaction } from '../../src/controllers/parseTransaction.js';

describe('ERC 721 Integration Test', function () {
    let contractData: ContractData;
    const bayc = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';

    before(async function () {
        contractData = await getContractData(bayc);
    });

    describe('non sales event', function () {
        it('should return null value of sales data', async function () {
            const txHash = '0xb648b7e773cf4267e10bae2f3502cd7df5a9542af5cd65f6d7f167ed84ba0b6c';
            const salesData = await parseTransaction(txHash, bayc, contractData);

            assert.strictEqual(salesData, null);
        });
    });

    describe('opensea sale event with fulfillBasicOrder', function () {
        it('should get the correct sales data', async function () {
            const txHash = '0xfd859948fcefe8ccb68a76fb18cc5c6bada9b117767b6bfa8280233b8567dbae';
            const tx = await parseTransaction(txHash, bayc, contractData);

            if (!tx) return;

            const isSameSize =
                tx.tokens.length === tx.prices.length && tx.tokens.length === tx.marketList.length;

            expect(isSameSize).to.be.true;
            expect(tx.tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(tx.fromAddr ?? '')).to.be.true;
            expect(ethers.utils.isAddress(tx.toAddr ?? '')).to.be.true;
            expect(ethers.utils.isAddress(tx.sweeperAddr ?? '')).to.be.true;
            assert.strictEqual(tx.market.name, 'opensea');
            assert.strictEqual(tx.market, tx.marketList[0]);
            assert.strictEqual(tx.transactionHash, txHash);
        });
    });

    describe('looksrare sale event', function () {
        it('should get the correct sales data', async function () {
            const txHash = '0x0667c6400daf1d306f84fe17ae454de73d4c002bb3b6eb650135dc65aefafb11';
            const tx = await parseTransaction(txHash, bayc, contractData);

            if (!tx) return;

            const isSameSize =
                tx.tokens.length === tx.prices.length && tx.tokens.length === tx.marketList.length;

            expect(isSameSize).to.be.true;
            expect(tx.tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(tx.fromAddr ?? '')).to.be.true;
            expect(ethers.utils.isAddress(tx.toAddr ?? '')).to.be.true;
            expect(ethers.utils.isAddress(tx.sweeperAddr ?? '')).to.be.true;
            assert.strictEqual(tx.market.name, 'looksrare');
            assert.strictEqual(tx.market, tx.marketList[0]);
            assert.strictEqual(tx.transactionHash, txHash);
        });
    });

    describe('x2y2 sale event', function () {
        it('should get the correct sales data', async function () {
            const txHash = '0x1637a01b632cc5e350b2f87d328fe0b9cf31dddb6158a7c5c27b502a3077367b';
            const tx = await parseTransaction(txHash, bayc, contractData);

            if (!tx) return;

            const isSameSize =
                tx.tokens.length === tx.prices.length && tx.tokens.length === tx.marketList.length;

            expect(isSameSize).to.be.true;
            expect(tx.tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(tx.fromAddr ?? '')).to.be.true;
            expect(ethers.utils.isAddress(tx.toAddr ?? '')).to.be.true;
            expect(ethers.utils.isAddress(tx.sweeperAddr ?? '')).to.be.true;
            assert.strictEqual(tx.market.name, 'x2y2');
            assert.strictEqual(tx.market, tx.marketList[0]);
            assert.strictEqual(tx.transactionHash, txHash);
        });
    });

    describe('opensea bundle sale event', function () {
        it('should get the correct sales data', async function () {
            const txHash = '0x29c8558da8ae6640c3a779cc8a530de6d437f924ff6f72da9c5a2805f20658c9';
            const lilChimps = '0x769250862220d509fb9bed5f88d824c9fb74a833';
            const lilChimpsContractData = await getContractData(lilChimps);
            const tx = await parseTransaction(txHash, lilChimps, lilChimpsContractData);

            if (!tx) return;

            assert.strictEqual(tx.tokens.length, 2);
            assert.strictEqual(tx.prices.length, 1);
            assert.strictEqual(tx.prices[0], '0.1');
            assert.strictEqual(tx.marketList.length, 1);
            expect(ethers.utils.isAddress(tx.fromAddr ?? '')).to.be.true;
            expect(ethers.utils.isAddress(tx.toAddr ?? '')).to.be.true;
            expect(ethers.utils.isAddress(tx.sweeperAddr ?? '')).to.be.true;
            assert.strictEqual(tx.market.name, 'opensea');
            assert.strictEqual(tx.market, tx.marketList[0]);
            assert.strictEqual(tx.transactionHash, txHash);
            expect(tx.tokenData).to.not.be.null;
        });
    });

    describe('gem swap event', function () {
        it('should get the correct sales data', async function () {
            const otherDeed = '0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258';
            const txHash = '0x97f8a3fa7f3e69959ec716e9d0395497ef01cf25c526eadb243a9a0747210245';
            const otherContractData = await getContractData(otherDeed);
            const tx = await parseTransaction(txHash, otherDeed, otherContractData);

            if (!tx) return;

            const isSameSize =
                tx.tokens.length === tx.prices.length && tx.tokens.length === tx.marketList.length;

            expect(isSameSize).to.be.true;
            expect(tx.tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(tx.sweeperAddr ?? '')).to.be.true;
            assert.strictEqual(tx.market.name, 'gem');
            assert.strictEqual(tx.transactionHash, txHash);
        });
    });

    describe('genie swap event', function () {
        it('should get the correct sales data', async function () {
            const pudgyPeguin = '0xbd3531da5cf5857e7cfaa92426877b022e612cf8';
            const txHash = '0x2f142466062b0c6565144c9eb2a57e0aebcda40ce194950be76532d99a3d465a';
            const pudgyContractData = await getContractData(pudgyPeguin);
            const tx = await parseTransaction(txHash, pudgyPeguin, pudgyContractData);

            if (!tx) return;

            const isSameSize =
                tx.tokens.length === tx.prices.length && tx.tokens.length === tx.marketList.length;

            expect(isSameSize).to.be.true;
            expect(tx.tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(tx.sweeperAddr ?? '')).to.be.true;
            assert.strictEqual(tx.market.name, 'genie');
            assert.strictEqual(tx.transactionHash, txHash);
        });
    });

    describe('genie swap event with mixed nft', function () {
        it('should get the correct sales data of specify nft', async function () {
            const murakamiFlowers = '0x7d8820fa92eb1584636f4f5b8515b5476b75171a';
            const txHash = '0x60115b829689c4f64d68ecdffa25d3a4070514594e87bb8891b600d48db884c1';
            const mfContractData = await getContractData(murakamiFlowers);
            const tx = await parseTransaction(txHash, murakamiFlowers, mfContractData);

            if (!tx) return;

            const isSameSize =
                tx.tokens.length === tx.prices.length && tx.tokens.length === tx.marketList.length;

            expect(isSameSize).to.be.true;
            expect(ethers.utils.isAddress(tx.sweeperAddr ?? '')).to.be.true;
            assert.strictEqual(tx.market.name, 'genie');
            assert.strictEqual(tx.transactionHash, txHash);
            expect(tx.tokenData).to.not.be.null;
        });
    });

    describe('opensea sale event with matchAdvancedOrders', function () {
        it('should get the correct sales data', async function () {
            const murakamiFlowers = '0x7d8820fa92eb1584636f4f5b8515b5476b75171a';
            const txHash = '0x5199ba954f7963e059dc55d9d9f87cff111471f03b5c6f1dc926c17556893ab3';
            const tx = await parseTransaction(txHash, murakamiFlowers, contractData);

            if (!tx) return;

            const isSameSize =
                tx.tokens.length === tx.prices.length && tx.tokens.length === tx.marketList.length;

            expect(isSameSize).to.be.true;
            expect(tx.tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(tx.fromAddr ?? '')).to.be.true;
            expect(ethers.utils.isAddress(tx.toAddr ?? '')).to.be.true;
            expect(ethers.utils.isAddress(tx.sweeperAddr ?? '')).to.be.true;
            assert.strictEqual(tx.market.name, 'opensea');
            assert.strictEqual(tx.market, tx.marketList[0]);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.totalPrice, 1.509);
        });
    });
});
