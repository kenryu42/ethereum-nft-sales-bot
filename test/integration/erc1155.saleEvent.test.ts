import 'dotenv/config';
import { ethers } from 'ethers';
import assert from 'assert';
import { expect } from 'chai';
import { formatPrice } from '../../src/utils/helper.js';
import { Auth, ENFT } from '../../src/index.js';

describe('ERC1155 Integration Test', function () {
    const auth = new Auth({
        alchemy: {
            apiKey: process.env.ALCHEMY_API_KEY ?? ''
        }
    });
    const client = new ENFT(auth);

    describe('non sales event', function () {
        it('should return null value of sales data', async function () {
            const mf_seed = '0x341a1c534248966c4b6afad165b98daed4b964ef';
            const txHash =
                '0xb648b7e773cf4267e10bae2f3502cd7df5a9542af5cd65f6d7f167ed84ba0b6c';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: mf_seed
            });

            assert.strictEqual(tx, null);
        });
    });

    describe('erc1155 opensea sale event', function () {
        it('should get the correct sales data', async function () {
            const mf_seed = '0x341a1c534248966c4b6afad165b98daed4b964ef';
            const txHash =
                '0xd186be50152064da83f8b2ebdabd2a47781d86ecbaff8c7f20dbda54172eaabb';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: mf_seed
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['0'];

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.not.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            assert.strictEqual(tx.contractData.tokenType, 'ERC1155');
            assert.strictEqual(
                tx.fromAddr,
                '0x5A7CA6864fbC2deBCef14533dC23a9aa2588B617'
            );
            assert.strictEqual(
                tx.toAddr,
                '0x324621B042d83869A9b79cf2945b12Ca0F5D24bc'
            );
            expect(tokenIds).to.have.members(tokenIdsTruth);
            assert.strictEqual(formatPrice(tx.totalPrice), '4.9496');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, mf_seed);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'opensea');
        });
    });

    describe('erc1155 looksrare sale event', function () {
        it('should get the correct sales data', async function () {
            const mf_seed = '0x341a1c534248966c4b6afad165b98daed4b964ef';
            const txHash =
                '0xe25f416de1119211439c3a3037af875d70c036e76435fbe361e174050c159d8d';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: mf_seed
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['0'];

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.not.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            assert.strictEqual(tx.contractData.tokenType, 'ERC1155');
            assert.strictEqual(
                tx.fromAddr,
                '0x0BC07389c28e3bf60E404742e54102de5F245C75'
            );
            assert.strictEqual(
                tx.toAddr,
                '0xB17602097CbF37aD79fbF0883D92D87c3D2A200d'
            );
            expect(tokenIds).to.have.members(tokenIdsTruth);
            assert.strictEqual(formatPrice(tx.totalPrice), '3.77');
            assert.strictEqual(tx.currency.name, 'WETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, mf_seed);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'looksrare');
        });
    });

    describe('erc1155 opensea sweep sales event', function () {
        it('should get the correct sales data', async function () {
            const GxngYxngEditions =
                '0xedfc4f35060de1a30e08b0d8b9986a4adbdf6c59';
            const txHash =
                '0x08b5e00b59dcb9a471bffd089cec33b5875a4e5e23cfa821635b8b6685c945e8';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: GxngYxngEditions
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;

            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['20', '21', '22'];

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            assert.strictEqual(tx.contractData.tokenType, 'ERC1155');
            assert.strictEqual(
                tx.toAddr,
                '0x63F42bfc17b6FF3a7f487C406B8E006D0D4970c3'
            );
            expect(tokenIds).to.have.members(tokenIdsTruth);
            assert.strictEqual(formatPrice(tx.totalPrice), '3.7293');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 45);
            assert.strictEqual(tx.contractAddress, GxngYxngEditions);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'opensea');
        });
    });

    // Todo
    describe('gem swap event', function () {
        it('todo...', async function () {
            expect(true).to.be.true;
        });
    });

    describe('genie swap event with mixed nft', function () {
        it('should get the correct sales data of specify nft', async function () {
            const mnlth = '0x86825dfca7a6224cfbd2da48e85df2fc3aa7c4b1';
            const txHash =
                '0x60115b829689c4f64d68ecdffa25d3a4070514594e87bb8891b600d48db884c1';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: mnlth
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;

            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['1'];

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            assert.strictEqual(tx.contractData.tokenType, 'ERC1155');
            assert.strictEqual(
                tx.toAddr,
                '0x7C9d38515a8999DdD3E4DDCc5e0133e68c18587d'
            );
            expect(tokenIds).to.have.members(tokenIdsTruth);
            assert.strictEqual(formatPrice(tx.totalPrice), '4.468');
            assert.strictEqual(tx.currency.name, 'WETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, mnlth);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'genie');
        });
    });
});
