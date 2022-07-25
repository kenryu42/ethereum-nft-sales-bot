import assert from 'assert';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { WEB3 } from '../../config/setup.js';
import { parseTransaction } from '../../controllers/parseTransaction.js';

describe('ERC 721 Integration Test', function () {
    const token_type = 'ERC721';
    const bayc = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';

    describe('non sales event', function () {
        it('should return null value of sales data', async function () {
            const txHash = '0xb648b7e773cf4267e10bae2f3502cd7df5a9542af5cd65f6d7f167ed84ba0b6c';
            const salesData = await parseTransaction(WEB3, txHash, bayc, token_type);

            assert.strictEqual(salesData, null);
        });
    });

    describe('opensea sale event', function () {
        it('should get the correct sales data', async function () {
            const txHash = '0xfd859948fcefe8ccb68a76fb18cc5c6bada9b117767b6bfa8280233b8567dbae';
            const salesData = await parseTransaction(WEB3, txHash, bayc, token_type);

            const {
                tokens,
                prices,
                tokenData,
                marketList,
                market,
                fromAddr,
                toAddr,
                sweeperAddr,
                transactionHash
            } = salesData;

            const isSameSize =
                tokens.length === prices.length && tokens.length === marketList.length;

            expect(isSameSize).to.be.true;
            expect(ethers.utils.isAddress(fromAddr)).to.be.true;
            expect(ethers.utils.isAddress(toAddr)).to.be.true;
            expect(ethers.utils.isAddress(sweeperAddr)).to.be.true;
            assert.strictEqual(market.name, 'Opensea: Seaport ⚓️');
            assert.strictEqual(market, marketList[0]);
            assert.strictEqual(transactionHash, txHash);
            assert.strictEqual(tokenData.status, 200);
        });
    });

    describe('looksrare sale event', function () {
        it('should get the correct sales data', async function () {
            const txHash = '0x0667c6400daf1d306f84fe17ae454de73d4c002bb3b6eb650135dc65aefafb11';
            const salesData = await parseTransaction(WEB3, txHash, bayc, token_type);

            const {
                tokens,
                prices,
                tokenData,
                marketList,
                market,
                fromAddr,
                toAddr,
                sweeperAddr,
                transactionHash
            } = salesData;

            const isSameSize =
                tokens.length === prices.length && tokens.length === marketList.length;

            expect(isSameSize).to.be.true;
            expect(ethers.utils.isAddress(fromAddr)).to.be.true;
            expect(ethers.utils.isAddress(toAddr)).to.be.true;
            expect(ethers.utils.isAddress(sweeperAddr)).to.be.true;
            assert.strictEqual(market.name, 'LooksRare 👀💎');
            assert.strictEqual(market, marketList[0]);
            assert.strictEqual(transactionHash, txHash);
            assert.strictEqual(tokenData.status, 200);
        });
    });

    describe('x2y2 sale event', function () {
        it('should get the correct sales data', async function () {
            const txHash = '0x1637a01b632cc5e350b2f87d328fe0b9cf31dddb6158a7c5c27b502a3077367b';
            const salesData = await parseTransaction(WEB3, txHash, bayc, token_type);

            const {
                tokens,
                prices,
                tokenData,
                marketList,
                market,
                fromAddr,
                toAddr,
                sweeperAddr,
                transactionHash
            } = salesData;

            const isSameSize =
                tokens.length === prices.length && tokens.length === marketList.length;

            expect(isSameSize).to.be.true;
            expect(ethers.utils.isAddress(fromAddr)).to.be.true;
            expect(ethers.utils.isAddress(toAddr)).to.be.true;
            expect(ethers.utils.isAddress(sweeperAddr)).to.be.true;
            assert.strictEqual(market.name, 'X2Y2 ⭕️');
            assert.strictEqual(market, marketList[0]);
            assert.strictEqual(transactionHash, txHash);
            assert.strictEqual(tokenData.status, 200);
        });
    });

    describe('opensea bundle sale event', function () {
        it('should get the correct sales data', async function () {
            const txHash = '0x29c8558da8ae6640c3a779cc8a530de6d437f924ff6f72da9c5a2805f20658c9';
            const lilChimps = '0x769250862220d509fb9bed5f88d824c9fb74a833';
            const salesData = await parseTransaction(WEB3, txHash, lilChimps, token_type);

            const {
                tokens,
                prices,
                tokenData,
                marketList,
                market,
                fromAddr,
                toAddr,
                sweeperAddr,
                transactionHash
            } = salesData;

            assert.strictEqual(tokens.length, 2);
            assert.strictEqual(prices.length, 1);
            assert.strictEqual(prices[0], '0.10');
            assert.strictEqual(marketList.length, 1);
            expect(ethers.utils.isAddress(fromAddr)).to.be.true;
            expect(ethers.utils.isAddress(toAddr)).to.be.true;
            expect(ethers.utils.isAddress(sweeperAddr)).to.be.true;
            assert.strictEqual(market.name, 'Opensea: Seaport ⚓️');
            assert.strictEqual(market, marketList[0]);
            assert.strictEqual(transactionHash, txHash);
            assert.strictEqual(tokenData.status, 200);
        });
    });

    describe('gem swap event', function () {
        it('should get the correct sales data', async function () {
            const beanz = '0x306b1ea3ecdf94ab739f1910bbda052ed4a9f949';
            const txHash = '0x9cdb1f154b4c2b6feb31e000435ce534c2e8197b47f3ed0cec2c24dfc4d04f82';
            const salesData = await parseTransaction(WEB3, txHash, beanz, token_type);

            const { tokens, prices, tokenData, marketList, market, sweeperAddr, transactionHash } =
                salesData;

            const isSameSize =
                tokens.length === prices.length && tokens.length === marketList.length;

            expect(isSameSize).to.be.true;
            expect(ethers.utils.isAddress(sweeperAddr)).to.be.true;
            assert.strictEqual(market.name, 'Gem 💎');
            assert.strictEqual(transactionHash, txHash);
            assert.strictEqual(tokenData.status, 200);
        });
    });

    describe('genie swap event', function () {
        it('should get the correct sales data', async function () {
            const meebits = '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7';
            const txHash = '0xc952d3c1b21e14c34389224643fad9f7094702788ba3a65e0ba0c874d2c22bb7';
            const salesData = await parseTransaction(WEB3, txHash, meebits, token_type);

            const { tokens, prices, tokenData, marketList, market, sweeperAddr, transactionHash } =
                salesData;

            const isSameSize =
                tokens.length === prices.length && tokens.length === marketList.length;

            expect(isSameSize).to.be.true;
            expect(ethers.utils.isAddress(sweeperAddr)).to.be.true;
            assert.strictEqual(market.name, 'Genie 🧞‍♂️');
            assert.strictEqual(transactionHash, txHash);
            assert.strictEqual(tokenData.status, 200);
        });
    });

    describe('gem swap event with mixed nft', function () {
        it('should get the correct sales data of specify nft', async function () {
            const neko = '0x0a8eb54b0123778291a3cddd2074c9ce8b2cfae5';
            const txHash = '0xcf337694d4c19d2930da7a8825c02e08376e47eb4775d801405ea4c9b4bdcb4c';
            const salesData = await parseTransaction(WEB3, txHash, neko, token_type);

            const { tokens, prices, tokenData, marketList, market, sweeperAddr, transactionHash } =
                salesData;

            const isSameSize =
                tokens.length === prices.length && tokens.length === marketList.length;

            expect(isSameSize).to.be.true;
            expect(ethers.utils.isAddress(sweeperAddr)).to.be.true;
            assert.strictEqual(market.name, 'Gem 💎');
            assert.strictEqual(transactionHash, txHash);
            assert.strictEqual(tokenData.status, 200);
        });
    });

    describe('genie swap event with mixed nft', function () {
        it('should get the correct sales data of specify nft', async function () {
            const murakamiFlowers = '0x7d8820fa92eb1584636f4f5b8515b5476b75171a';
            const txHash = '0x60115b829689c4f64d68ecdffa25d3a4070514594e87bb8891b600d48db884c1';
            const salesData = await parseTransaction(WEB3, txHash, murakamiFlowers, token_type);

            const { tokens, prices, tokenData, marketList, market, sweeperAddr, transactionHash } =
                salesData;

            const isSameSize =
                tokens.length === prices.length && tokens.length === marketList.length;

            expect(isSameSize).to.be.true;
            expect(ethers.utils.isAddress(sweeperAddr)).to.be.true;
            assert.strictEqual(market.name, 'Genie 🧞‍♂️');
            assert.strictEqual(transactionHash, txHash);
            assert.strictEqual(tokenData.status, 200);
        });
    });
});
