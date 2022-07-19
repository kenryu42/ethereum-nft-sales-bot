import { ethers } from 'ethers';
import { nftTraderAbi } from '../config/setup.js';
import { getReadableName } from '../utils/api.js';

const parseNftTrader = async ({ web3, log, swap, logAddress, decodedLogData }) => {
    const swapStatus = web3.eth.abi.decodeParameter('uint8', log.topics[3]);
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
    const flagFlatFee = swapIntent.flagFlatFee;
    const flagRoyalties = swapIntent.flagRoyalties;
    const flatFeeMaker = flagFlatFee ? swapIntent.flatFeeMaker : '0';
    const flatFeeTaker = flagFlatFee ? swapIntent.flatFeeTaker : '0';
    const royaltiesMaker = flagRoyalties ? swapIntent.royaltiesMaker : '0';
    const royaltiesTaker = flagRoyalties ? swapIntent.royaltiesTaker : '0';
    const platformFeeMaker =
        valueMaker !== '0' ? String(BigInt(valueMaker * (bps / scalePercent))) : '0';
    const platformFeeTaker =
        valueTaker !== '0' ? String(BigInt(valueTaker * (bps / scalePercent))) : '0';
    const maker = await getReadableName(addressMaker);
    const taker = await getReadableName(addressTaker);

    swap[addressMaker]
        ? (swap[addressMaker].name = maker)
        : (swap[addressMaker] = { name: maker, receivedAssets: [] });
    swap[addressTaker]
        ? (swap[addressTaker].name = taker)
        : (swap[addressTaker] = { name: taker, receivedAssets: [] });
    swap[addressMaker] = {
        ...swap[addressMaker],
        ...{
            receivedValue: ethers.utils.formatEther(
                BigInt(valueTaker - flatFeeTaker - royaltiesTaker - platformFeeTaker)
            )
        }
    };
    swap[addressTaker] = {
        ...swap[addressTaker],
        ...{
            receivedValue: ethers.utils.formatEther(
                BigInt(valueMaker - flatFeeMaker - royaltiesMaker - platformFeeMaker)
            )
        }
    };

    return [addressMaker, addressTaker];
};

export { parseNftTrader };
