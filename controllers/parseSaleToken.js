import { transferEventTypes } from '../config/logEventTypes.js';
import _ from 'lodash';

const parseSaleToken = ({
    web3,
    log,
    logAddress,
    tokenType,
    tokens,
    tokenId,
    fromAddr,
    toAddr,
    contractAddress
}) => {
    if (
        log.data === '0x' &&
        transferEventTypes[tokenType] === log.topics[0] &&
        logAddress === contractAddress
    ) {
        fromAddr = web3.eth.abi.decodeParameter('address', log.topics[1]);
        toAddr = web3.eth.abi.decodeParameter('address', log.topics[2]);
        tokenId = web3.eth.abi.decodeParameter('uint256', log.topics[3]);
        tokens.push(tokenId);
        tokens = _.uniq(tokens);
    } else if (
        transferEventTypes[tokenType][0] === log.topics[0] &&
        logAddress === contractAddress
    ) {
        fromAddr = web3.eth.abi.decodeParameter('address', log.topics[2]);
        toAddr = web3.eth.abi.decodeParameter('address', log.topics[3]);
        const decodeData = web3.eth.abi.decodeLog(
            [
                { type: 'uint256', name: 'id' },
                { type: 'uint256', name: 'value' }
            ],
            log.data,
            []
        );
        tokenId = decodeData.id;
        tokens.push(Number(decodeData.value));
    }

    return { tokens, tokenId, fromAddr, toAddr };
};

export { parseSaleToken };
