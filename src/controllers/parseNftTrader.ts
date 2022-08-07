import { ethers } from 'ethers';
import Web3EthAbi from 'web3-eth-abi';
import { getReadableName } from '../utils/api.js';
import type { Log } from '@ethersproject/abstract-provider';
import type { TransactionData, SwapEvent } from '../types';
import { alchemy, NFT_TRADER_ABI } from '../config/setup.js';

const parseNftTrader = async (
    tx: TransactionData,
    log: Log,
    logAddress: string,
    decodedLogData: SwapEvent
) => {
    const swapStatus = String(Web3EthAbi.decodeParameter('uint8', log.topics[3]));
    // if tx.swap status is not 1 (closed), then skip parsing.
    // this check might be unnecessary for the new nft trader contract
    // because there is no transfer event for tx.swap status other than 1
    if (swapStatus !== '1') return null;

    const swapId = decodedLogData._swapId;
    const provider = await alchemy.config.getProvider();
    const nftTraderSwap = new ethers.Contract(logAddress, NFT_TRADER_ABI, provider);
    const swapIntent = await nftTraderSwap.getSwapIntentById(swapId);
    const payment = await nftTraderSwap.payment();
    const addressMaker = swapIntent.addressMaker.toLowerCase();
    const addressTaker = swapIntent.addressTaker.toLowerCase();
    const valueMaker = BigInt(swapIntent.valueMaker);
    const valueTaker = BigInt(swapIntent.valueTaker);
    const flagRoyalties = swapIntent.flagRoyalties;
    const royaltiesMaker = flagRoyalties ? BigInt(swapIntent.royaltiesMaker) : BigInt(0);
    const royaltiesTaker = flagRoyalties ? BigInt(swapIntent.royaltiesTaker) : BigInt(0);
    const platformFeeMaker = BigInt(Number(valueMaker) * (payment.bps / payment.scalePercent));
    const platformFeeTaker = BigInt(Number(valueTaker) * (payment.bps / payment.scalePercent));
    const maker = await getReadableName(addressMaker);
    const taker = await getReadableName(addressTaker);

    tx.swap.id = swapId;
    tx.swap[addressMaker]
        ? (tx.swap[addressMaker].name = maker)
        : (tx.swap[addressMaker] = { name: maker, receivedAssets: [] });
    tx.swap[addressTaker]
        ? (tx.swap[addressTaker].name = taker)
        : (tx.swap[addressTaker] = { name: taker, receivedAssets: [] });
    tx.swap[addressMaker] = {
        ...tx.swap[addressMaker],
        ...{
            receivedAmount: ethers.utils.formatEther(valueTaker - platformFeeTaker - royaltiesTaker)
        }
    };
    tx.swap[addressTaker] = {
        ...tx.swap[addressTaker],
        ...{
            receivedAmount: ethers.utils.formatEther(valueMaker - platformFeeMaker - royaltiesMaker)
        }
    };
    tx.swap[addressMaker].spentAssets = [...tx.swap[addressTaker].receivedAssets];
    tx.swap[addressMaker].spentAmount = ethers.utils.formatEther(valueMaker);
    tx.swap[addressTaker].spentAssets = [...tx.swap[addressMaker].receivedAssets];
    tx.swap[addressTaker].spentAmount = ethers.utils.formatEther(valueTaker);
    tx.addressMaker = addressMaker;
    tx.addressTaker = addressTaker;
};

export { parseNftTrader };
