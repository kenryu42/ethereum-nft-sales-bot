import { transferEventTypes } from '../config/logEventTypes.js';
import _ from 'lodash';

const parseSaleToken = ({ tx, web3, log, logAddress }) => {
    if (
        log.data === '0x' &&
        transferEventTypes[tx.tokenType] === log.topics[0] &&
        logAddress === tx.contractAddress
    ) {
        tx.fromAddr = web3.eth.abi.decodeParameter('address', log.topics[1]);
        tx.toAddr = web3.eth.abi.decodeParameter('address', log.topics[2]);
        tx.tokenId = web3.eth.abi.decodeParameter('uint256', log.topics[3]);
        tx.tokens.push(tx.tokenId);
        tx.tokens = _.uniq(tx.tokens);
    } else if (
        transferEventTypes[tx.tokenType][0] === log.topics[0] &&
        logAddress === tx.contractAddress
    ) {
        tx.fromAddr = web3.eth.abi.decodeParameter('address', log.topics[2]);
        tx.toAddr = web3.eth.abi.decodeParameter('address', log.topics[3]);
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
