import { ethers } from 'ethers';
import { NFT_TRADER_ABI } from '../config/setup.js';
import { getReadableName } from '../utils/api.js';

const parseNftTrader = async ({ tx, web3, log, logAddress, decodedLogData }) => {
    const swapStatus = web3.eth.abi.decodeParameter('uint8', log.topics[3]);
    // if tx.swap status is not 1 (closed), then skip parsing.
    // this check might be unnecessary for the new nft trader contract
    // because there is no transfer event for tx.swap status other than 1
    if (swapStatus !== '1') return null;

    const swapId = decodedLogData._swapId;
    const nftTraderSwap = new web3.eth.Contract(NFT_TRADER_ABI, logAddress);
    const swapIntent = await nftTraderSwap.methods.getSwapIntentById(swapId).call();
    const payment = await nftTraderSwap.methods.payment().call();
    const bps = payment.bps;
    const scalePercent = payment.scalePercent;
    const addressMaker = swapIntent.addressMaker.toLowerCase();
    const addressTaker = swapIntent.addressTaker.toLowerCase();
    const valueMaker = swapIntent.valueMaker;
    const valueTaker = swapIntent.valueTaker;
    const flagRoyalties = swapIntent.flagRoyalties;
    const royaltiesMaker = flagRoyalties ? swapIntent.royaltiesMaker : '0';
    const royaltiesTaker = flagRoyalties ? swapIntent.royaltiesTaker : '0';
    const platformFeeMaker =
        valueMaker !== '0' ? String(BigInt(valueMaker * (bps / scalePercent))) : '0';
    const platformFeeTaker =
        valueTaker !== '0' ? String(BigInt(valueTaker * (bps / scalePercent))) : '0';
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
            receivedAmount: ethers.utils.formatEther(
                BigInt(valueTaker - royaltiesTaker - platformFeeTaker)
            )
        }
    };
    tx.swap[addressTaker] = {
        ...tx.swap[addressTaker],
        ...{
            receivedAmount: ethers.utils.formatEther(
                BigInt(valueMaker - royaltiesMaker - platformFeeMaker)
            )
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
