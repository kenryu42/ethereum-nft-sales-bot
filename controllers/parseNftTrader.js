import { ethers } from 'ethers';
import { nftTraderAbi } from '../config/setup.js';
import { getReadableName } from '../utils/api.js';

const parseNftTrader = async ({ web3, log, swap, logAddress, decodedLogData }) => {
    const swapStatus = web3.eth.abi.decodeParameter('uint8', log.topics[3]);
    // if swap status is not 1 (closed), then skip parsing.
    // this check might be unnecessary for the new nft trader contract
    // because there is no transfer event for swap status other than 1
    if (swapStatus !== '1') return [null, null];

    const swapId = decodedLogData._swapId;
    const nftTraderSwap = new web3.eth.Contract(nftTraderAbi, logAddress);
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

    swap.id = swapId;
    swap[addressMaker]
        ? (swap[addressMaker].name = maker)
        : (swap[addressMaker] = { name: maker, receivedAssets: [] });
    swap[addressTaker]
        ? (swap[addressTaker].name = taker)
        : (swap[addressTaker] = { name: taker, receivedAssets: [] });
    swap[addressMaker] = {
        ...swap[addressMaker],
        ...{
            receivedAmount: ethers.utils.formatEther(
                BigInt(valueTaker - royaltiesTaker - platformFeeTaker)
            )
        }
    };
    swap[addressTaker] = {
        ...swap[addressTaker],
        ...{
            receivedAmount: ethers.utils.formatEther(
                BigInt(valueMaker - royaltiesMaker - platformFeeMaker)
            )
        }
    };
    swap[addressMaker].spentAssets = [...swap[addressTaker].receivedAssets];
    swap[addressMaker].spentAmount = ethers.utils.formatEther(valueMaker);
    swap[addressTaker].spentAssets = [...swap[addressMaker].receivedAssets];
    swap[addressTaker].spentAmount = ethers.utils.formatEther(valueTaker);

    return [addressMaker, addressTaker];
};

export { parseNftTrader };
