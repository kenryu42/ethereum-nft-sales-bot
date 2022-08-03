import Web3EthAbi from 'web3-eth-abi';
import { transferEventTypes } from '../config/logEventTypes.js';
import _ from 'lodash';
import { TransactionData } from '../types/types';
import { Log } from '@ethersproject/abstract-provider';

const parseSaleToken = (tx: TransactionData, log: Log, logAddress: string) => {
    if (
        log.data === '0x' &&
        log.topics[0] === transferEventTypes.ERC721 &&
        logAddress === tx.contractAddress
    ) {
        tx.fromAddr = String(Web3EthAbi.decodeParameter('address', log.topics[1]));
        tx.toAddr = String(Web3EthAbi.decodeParameter('address', log.topics[2]));
        tx.tokenId = String(Web3EthAbi.decodeParameter('uint256', log.topics[3]));
        tx.tokens.push(Number(tx.tokenId));
        tx.tokens = _.uniq(tx.tokens);
    } else if (
        transferEventTypes.ERC1155.includes(log.topics[0]) &&
        logAddress === tx.contractAddress
    ) {
        tx.fromAddr = String(Web3EthAbi.decodeParameter('address', log.topics[2]));
        tx.toAddr = String(Web3EthAbi.decodeParameter('address', log.topics[3]));
        const decodeData = Web3EthAbi.decodeLog(
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
