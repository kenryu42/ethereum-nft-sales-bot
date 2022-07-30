import { AlchemyWeb3 } from '@alch/alchemy-web3';
import { Log } from 'web3-core';
import { AbiItem } from 'web3-utils';
import { ethers } from 'ethers';
import { NFT_TRADER_ABI } from '../config/setup.js';
import { TransactionData, SwapEvent } from '../types/types';
import { getReadableName } from '../utils/api.js';

const parseNftTrader = async (
    tx: TransactionData,
    web3: AlchemyWeb3,
    log: Log,
    logAddress: string,
    decodedLogData: SwapEvent
) => {
    const swapStatus = String(web3.eth.abi.decodeParameter('uint8', log.topics[3]));
    // if tx.swap status is not 1 (closed), then skip parsing.
    // this check might be unnecessary for the new nft trader contract
    // because there is no transfer event for tx.swap status other than 1
    if (swapStatus !== '1') return null;

    const swapId = decodedLogData._swapId;
    const nftTraderSwap = new web3.eth.Contract(NFT_TRADER_ABI as AbiItem[], logAddress);
    const swapIntent = await nftTraderSwap.methods.getSwapIntentById(swapId).call();
    const payment = await nftTraderSwap.methods.payment().call();
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
