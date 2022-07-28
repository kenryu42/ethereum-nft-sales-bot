import { transferEventTypes } from '../config/logEventTypes';
import _ from 'lodash';
import { TransactionData } from '../types/types';
import { AlchemyWeb3 } from '@alch/alchemy-web3';

const parseSaleToken = (tx: TransactionData, web3: AlchemyWeb3, log: any, logAddress: string) => {
    if (
        log.data === '0x' &&
        transferEventTypes[tx.tokenType as keyof typeof transferEventTypes] === log.topics[0] &&
        logAddress === tx.contractAddress
    ) {
        tx.fromAddr = String(web3.eth.abi.decodeParameter('address', log.topics[1]));
        tx.toAddr = String(web3.eth.abi.decodeParameter('address', log.topics[2]));
        tx.tokenId = String(web3.eth.abi.decodeParameter('uint256', log.topics[3]));
        tx.tokens.push(Number(tx.tokenId));
        tx.tokens = _.uniq(tx.tokens);
    } else if (
        transferEventTypes[tx.tokenType as keyof typeof transferEventTypes][0] === log.topics[0] &&
        logAddress === tx.contractAddress
    ) {
        tx.fromAddr = String(web3.eth.abi.decodeParameter('address', log.topics[2]));
        tx.toAddr = String(web3.eth.abi.decodeParameter('address', log.topics[3]));
        const decodeData = web3.eth.abi.decodeLog(
            [
                { type: 'uint256', name: 'id' },
                { type: 'uint256', name: 'value' }
            ],
            log.data,
            []
        );
        tx.tokenId = decodeData.id;
        tx.tokens.push(Number(decodeData.value));
    }
};

export { parseSaleToken };
