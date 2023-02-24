import 'dotenv/config';
import assert from 'assert';
import { expect } from 'chai';
import { ethers } from 'ethers';
import { Auth, ENFT } from '../../src/index.js';
import { formatPrice } from '../../src/utils/helper.js';

describe('ERC721 Integration Test', function () {
    const auth = new Auth({
        alchemy: {
            apiKey: process.env.ALCHEMY_API_KEY ?? ''
        }
    });
    const client = new ENFT(auth);

    describe('ERC721 non sales event', function () {
        it('should return null value of sales data', async function () {
            const bayc = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
            const txHash =
                '0xb648b7e773cf4267e10bae2f3502cd7df5a9542af5cd65f6d7f167ed84ba0b6c';
            const salesData = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: bayc
            });

            assert.strictEqual(salesData, null);
        });
    });

    // Opensea test

    describe('opensea sale event with fulfillBasicOrder', function () {
        it('should get the correct sales data', async function () {
            const bayc = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
            const txHash =
                '0xfd859948fcefe8ccb68a76fb18cc5c6bada9b117767b6bfa8280233b8567dbae';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: bayc
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const [tokenId] = Object.keys(tx.tokens);

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.not.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            assert.strictEqual(tx.contractData.tokenType, 'ERC721');
            assert.strictEqual(
                tx.fromAddr,
                '0xd7236C5F78DFc0B1467d7809b99B393C9f5b6832'
            );
            assert.strictEqual(
                tx.toAddr,
                '0x605d36F54546eaC8318deA61670e48db3A071A36'
            );
            assert.strictEqual(tokenId, '5075');
            assert.strictEqual(formatPrice(tx.totalPrice), '82');
            assert.strictEqual(tx.currency.name, 'WETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, bayc);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'opensea');
        });
    });

    describe('opensea bundle sale event', function () {
        it('should get the correct sales data', async function () {
            const txHash =
                '0x29c8558da8ae6640c3a779cc8a530de6d437f924ff6f72da9c5a2805f20658c9';
            const lilChimps = '0x769250862220d509fb9bed5f88d824c9fb74a833';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: lilChimps
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['861', '1576'];

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            assert.strictEqual(tx.contractData.tokenType, 'ERC721');
            assert.strictEqual(
                tx.toAddr,
                '0xd0cd99551fDA524352138Df2269ed79c47E7AC8a'
            );
            expect(tokenIds).to.have.members(tokenIdsTruth);
            assert.strictEqual(formatPrice(tx.totalPrice), '0.1');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 2);
            assert.strictEqual(tx.contractAddress, lilChimps);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'opensea');
        });
    });

    describe('opensea sale event with matchAdvancedOrders', function () {
        it('should get the correct sales data', async function () {
            const murakamiFlowers =
                '0x7d8820fa92eb1584636f4f5b8515b5476b75171a';
            const txHash =
                '0x5199ba954f7963e059dc55d9d9f87cff111471f03b5c6f1dc926c17556893ab3';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: murakamiFlowers
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['153'];

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
                '0x5c05177243a9d81CaEF1d4fEab6750689d0363A6'
            );
            assert.strictEqual(
                tx.toAddr,
                '0x6e0e0A00D45b773E29dDA13F4E2da1B5bd01a44A'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '1.509');
            assert.strictEqual(tx.currency.name, 'WETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, murakamiFlowers);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'opensea');
        });
    });

    describe('opensea sale event with matchOrders (reserved sale)', function () {
        it('should get the correct sales data', async function () {
            const midnightBreeze = '0xd9c036e9eef725e5aca4a22239a23feb47c3f05d';
            const txHash =
                '0xd3b59b614dcbd4d00117eaf2db58706e4d3cf46a4d3d229f6604631388fdd3e6';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: midnightBreeze
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['2058'];

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
                '0xfA21cd545911E45e80a8CbE5466aa811FFaeb938'
            );
            assert.strictEqual(
                tx.toAddr,
                '0xD57721B29F2A17AB6A0635210CE05dBbECF5cBF4'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '0.945');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, midnightBreeze);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'opensea');
        });
    });

    // Looksrare test

    describe('looksrare sale event', function () {
        it('should get the correct sales data', async function () {
            const bayc = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
            const txHash =
                '0x0667c6400daf1d306f84fe17ae454de73d4c002bb3b6eb650135dc65aefafb11';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: bayc
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;

            const [tokenId] = Object.keys(tx.tokens);

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.not.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            assert.strictEqual(tx.contractData.tokenType, 'ERC721');
            assert.strictEqual(
                tx.fromAddr,
                '0xff0288877e2b1186c701e024C02f17DA04b2b913'
            );
            assert.strictEqual(
                tx.toAddr,
                '0x138B9057D61E893b72B33AB2d17F24aC87bD33CB'
            );
            assert.strictEqual(tokenId, '7572');
            assert.strictEqual(formatPrice(tx.totalPrice), '90');
            assert.strictEqual(tx.currency.name, 'WETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, bayc);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'looksrare');
        });
    });

    // X2Y2 test

    describe('x2y2 sale event', function () {
        it('should get the correct sales data', async function () {
            const bayc = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
            const txHash =
                '0x1637a01b632cc5e350b2f87d328fe0b9cf31dddb6158a7c5c27b502a3077367b';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: bayc
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const [tokenId] = Object.keys(tx.tokens);

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.not.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            assert.strictEqual(tx.contractData.tokenType, 'ERC721');
            assert.strictEqual(
                tx.fromAddr,
                '0x888E552FC9A9DbFaA5B854bc6F128c1A4142aD28'
            );
            assert.strictEqual(
                tx.toAddr,
                '0xFa89ec40699Bbfd749c4eb6643dC2B22fF0e2aa6'
            );
            assert.strictEqual(tokenId, '5919');
            assert.strictEqual(formatPrice(tx.totalPrice), '105');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, bayc);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'x2y2');
        });
    });

    // Blur test

    describe('blurswap sale event', function () {
        it('should get the correct sales data', async function () {
            const murakamiFlowers =
                '0x7d8820fa92eb1584636f4f5b8515b5476b75171a';
            const txHash =
                '0xaa8e649981d364353631415ebfb70f5634641c61853bc072fba1c8b05dc7a8c0';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: murakamiFlowers
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['5532'];

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(tx.isBlurBid).to.be.undefined;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            expect(tokenIds).to.have.members(tokenIdsTruth);
            assert.strictEqual(tx.contractData.tokenType, 'ERC721');
            assert.strictEqual(
                tx.toAddr,
                '0x82cA345C167BDCAd56FbedC7cc85a488885BDAdc'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '1.09');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, murakamiFlowers);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'blurswap');
        });
    });

    describe('blur sales event', function () {
        it('should get the correct sales data', async function () {
            const azuki = '0xed5af388653567af2f388e6224dc7c4b3241c544';
            const txHash =
                '0xbe99f782591be21c2f5872e29e975a1dfbf93638bf3c2fd7a2f7cd121ce12ae3';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: azuki
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['3316'];

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
                '0x9feA69241d851fF897BcB9eBd8aC2839243F7aEC'
            );
            assert.strictEqual(
                tx.toAddr,
                '0xD5eE00b7BAbd9374D32159CD7cD82bb99eF831fd'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '13.49');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, azuki);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'blur');
        });
    });

    describe('blur bundle bid sales event', function () {
        it('should get the correct sales data', async function () {
            const midnightBreeze = '0xd9c036e9eef725e5aca4a22239a23feb47c3f05d';
            const txHash =
                '0xd1b255093a7816d82ae2903b12b42be0d6df967eaa59ffcdbabf29fb8686a6d5';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: midnightBreeze
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['695', '2061', '5743'];

            expect(tx.tokens).to.not.be.undefined;
            expect(tx.fromAddr).to.not.be.undefined;
            expect(tx.toAddr).to.not.be.undefined;
            expect(tx.fromAddrName).to.be.undefined;
            expect(tx.toAddrName).to.not.be.undefined;
            expect(tx.isBlurBid).to.be.true;
            expect(ethers.isAddress(tx.fromAddr)).to.be.true;
            expect(ethers.isAddress(tx.toAddr)).to.be.true;
            expect(ethers.isAddress(tx.contractAddress)).to.be.true;
            expect(tokenIds).to.have.members(tokenIdsTruth);
            assert.strictEqual(tx.contractData.tokenType, 'ERC721');
            assert.strictEqual(
                tx.toAddr,
                '0x0F23300B85FE86B0d4E568bAD53627ea9aF4776B'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '0.52');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 3);
            assert.strictEqual(tx.contractAddress, midnightBreeze);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'blur');
        });
    });

    // Gem test

    describe('gem swap event', function () {
        it('should get the correct sales data', async function () {
            const otherDeed = '0x34d85c9cdeb23fa97cb08333b511ac86e1c4e258';
            const txHash =
                '0x97f8a3fa7f3e69959ec716e9d0395497ef01cf25c526eadb243a9a0747210245';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: otherDeed
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = [
                '62017',
                '76196',
                '80831',
                '99013',
                '66801',
                '88926'
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
                '0x1B380BAa5b597CFA53bCC6A9C71e01C86D02370f'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '10.456');
            assert.strictEqual(tx.currency.name, 'WETH');
            assert.strictEqual(tx.totalAmount, 6);
            assert.strictEqual(tx.contractAddress, otherDeed);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'gem');
        });
    });

    // Genie test

    describe('genie swap event', function () {
        it('should get the correct sales data', async function () {
            const pudgyPeguin = '0xbd3531da5cf5857e7cfaa92426877b022e612cf8';
            const txHash =
                '0x2f142466062b0c6565144c9eb2a57e0aebcda40ce194950be76532d99a3d465a';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: pudgyPeguin
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['3351', '1854', '5801'];

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
                '0x0881F1b273693f1a2eE01a5B0c2F06F3F8432754'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '13.97');
            assert.strictEqual(tx.currency.name, 'ETH');
            assert.strictEqual(tx.totalAmount, 3);
            assert.strictEqual(tx.contractAddress, pudgyPeguin);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'genie');
        });
    });

    describe('genie swap event with mixed nft', function () {
        it('should get the correct sales data of specify nft', async function () {
            const murakamiFlowers =
                '0x7d8820fa92eb1584636f4f5b8515b5476b75171a';
            const txHash =
                '0x60115b829689c4f64d68ecdffa25d3a4070514594e87bb8891b600d48db884c1';
            const tx = await client.debugTransaction({
                test: true,
                transactionHash: txHash,
                contractAddress: murakamiFlowers
            });

            if (!tx || !tx.fromAddr || !tx.toAddr) return;
            const tokenIds = Object.keys(tx.tokens);
            const tokenIdsTruth = ['203'];

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
                '0x7C9d38515a8999DdD3E4DDCc5e0133e68c18587d'
            );
            assert.strictEqual(formatPrice(tx.totalPrice), '2.85');
            assert.strictEqual(tx.currency.name, 'WETH');
            assert.strictEqual(tx.totalAmount, 1);
            assert.strictEqual(tx.contractAddress, murakamiFlowers);
            assert.strictEqual(tx.transactionHash, txHash);
            assert.strictEqual(tx.interactedMarket.name, 'genie');
        });
    });
});
