import Web3EthAbi from 'web3-eth-abi';
import type { NftTokenType } from 'alchemy-sdk';
import type { TransactionData } from '../types';
import { transferEventTypes } from '../config/logEventTypes.js';
import type { Log } from '@ethersproject/abstract-provider';

const parseSwapToken = (tx: TransactionData, log: Log, logAddress: string) => {
    if (tx.isSwap && log.topics[0] === transferEventTypes.ERC721) {
        const receivedAddr = Web3EthAbi.decodeParameter('address', log.topics[2]).toLowerCase();

        tx.tokenId = String(Web3EthAbi.decodeParameter('uint256', log.topics[3]));
        if (logAddress === tx.contractAddress) tx.swap.monitorTokenId = tx.tokenId;

        receivedAddr in tx.swap
            ? tx.swap[receivedAddr].receivedAssets.push({
                  tokenId: tx.tokenId,
                  tokenType: 'ERC721' as NftTokenType,
                  contractAddress: logAddress
              })
            : (tx.swap[receivedAddr] = {
                  receivedAssets: [
                      {
                          tokenId: tx.tokenId,
                          tokenType: 'ERC721' as NftTokenType,
                          contractAddress: logAddress
                      }
                  ]
              });
    } else if (tx.isSwap && transferEventTypes.ERC1155.includes(log.topics[0])) {
        const receivedAddr = Web3EthAbi.decodeParameter('address', log.topics[3]).toLowerCase();
        const decodeData = Web3EthAbi.decodeLog(
            [
                { type: 'uint256[]', name: 'ids' },
                { type: 'uint256[]', name: 'values' }
            ],
            log.data,
            []
        );

        tx.tokenId = decodeData.ids[0];
        if (logAddress === tx.contractAddress) tx.swap.monitorTokenId = tx.tokenId;

        for (let i = 0; i < decodeData.ids.length; i++) {
            receivedAddr in tx.swap
                ? tx.swap[receivedAddr].receivedAssets.push({
                      tokenId: decodeData.ids[i],
                      tokenType: 'ERC1155' as NftTokenType,
                      quantity: Number(decodeData.values[i]),
                      contractAddress: logAddress
                  })
                : (tx.swap[receivedAddr] = {
                      receivedAssets: [
                          {
                              tokenId: decodeData.ids[i],
                              tokenType: 'ERC1155' as NftTokenType,
                              quantity: Number(decodeData.values[i]),
                              contractAddress: logAddress
                          }
                      ]
                  });
        }
    }
};

export { parseSwapToken };
