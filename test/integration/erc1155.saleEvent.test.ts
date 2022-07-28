import assert from 'assert';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import { ContractData } from '../../types/types';
import { getContractData } from '../../utils/api';
import { ALCHEMY_API_KEY } from '../../config/setup';
import { parseTransaction } from '../../controllers/parseTransaction';

describe('ERC 1155 Integration Test', function () {
    let contractData: ContractData;
    const mf_seed = '0x341a1c534248966c4b6afad165b98daed4b964ef';
    const web3 = createAlchemyWeb3(`wss://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`);

    before(async function () {
        contractData = await getContractData(mf_seed);
    });

    describe('non sales event', function () {
        it('should return null value of sales data', async function () {
            const txHash = '0xb648b7e773cf4267e10bae2f3502cd7df5a9542af5cd65f6d7f167ed84ba0b6c';
            const salesData = await parseTransaction(web3, txHash, mf_seed, contractData);

            assert.strictEqual(salesData, null);
        });
    });

    describe('opensea sale event', function () {
        it('should get the correct sales data', async function () {
            const txHash = '0xd186be50152064da83f8b2ebdabd2a47781d86ecbaff8c7f20dbda54172eaabb';
            const salesData = await parseTransaction(web3, txHash, mf_seed, contractData);
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
            } = salesData!;
            const isSameSize =
                tokens.length === prices.length && tokens.length === marketList.length;

            expect(isSameSize).to.be.true;
            expect(tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(fromAddr!)).to.be.true;
            expect(ethers.utils.isAddress(toAddr!)).to.be.true;
            expect(ethers.utils.isAddress(sweeperAddr!)).to.be.true;
            assert.strictEqual(market.name, 'Opensea: Seaport ⚓️');
            assert.strictEqual(market, marketList[0]);
            assert.strictEqual(transactionHash, txHash);
        });
    });

    describe('looksrare sale event', function () {
        it('should get the correct sales data', async function () {
            const txHash = '0xe25f416de1119211439c3a3037af875d70c036e76435fbe361e174050c159d8d';
            const salesData = await parseTransaction(web3, txHash, mf_seed, contractData);
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
            } = salesData!;
            const isSameSize =
                tokens.length === prices.length && tokens.length === marketList.length;

            expect(isSameSize).to.be.true;
            expect(tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(fromAddr!)).to.be.true;
            expect(ethers.utils.isAddress(toAddr!)).to.be.true;
            expect(ethers.utils.isAddress(sweeperAddr!)).to.be.true;
            assert.strictEqual(market.name, 'LooksRare 👀💎');
            assert.strictEqual(market, marketList[0]);
            assert.strictEqual(transactionHash, txHash);
        });
    });

    describe('gem swap event', function () {
        it('should get the correct sales data', async function () {
            const txHash = '0xf63b30d797e9e2febca32a56eee29bff32257cc791f5a58a5fdf78f6caf66df9';
            const salesData = await parseTransaction(web3, txHash, mf_seed, contractData);
            const { tokens, prices, tokenData, marketList, market, sweeperAddr, transactionHash } =
                salesData!;
            const isSameSize =
                tokens.length === prices.length && tokens.length === marketList.length;

            expect(isSameSize).to.be.true;
            expect(tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(sweeperAddr!)).to.be.true;
            assert.strictEqual(market.name, 'Gem 💎');
            assert.strictEqual(transactionHash, txHash);
        });
    });

    describe('genie swap event with mixed nft', function () {
        it('should get the correct sales data of specify nft', async function () {
            const mnlth = '0x86825dfca7a6224cfbd2da48e85df2fc3aa7c4b1';
            const txHash = '0x60115b829689c4f64d68ecdffa25d3a4070514594e87bb8891b600d48db884c1';
            const mnlthContractData = await getContractData(mnlth);
            const salesData = await parseTransaction(web3, txHash, mnlth, mnlthContractData);
            const { tokens, prices, tokenData, marketList, market, sweeperAddr, transactionHash } =
                salesData!;
            const isSameSize =
                tokens.length === prices.length && tokens.length === marketList.length;

            expect(isSameSize).to.be.true;
            expect(tokenData).to.not.be.null;
            expect(ethers.utils.isAddress(sweeperAddr!)).to.be.true;
            assert.strictEqual(market.name, 'Genie 🧞‍♂️');
            assert.strictEqual(transactionHash, txHash);
        });
    });
});
