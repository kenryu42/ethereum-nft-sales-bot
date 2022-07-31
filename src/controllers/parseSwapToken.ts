import { Log } from 'web3-core';
import { AlchemyWeb3 } from '@alch/alchemy-web3';
import { TransactionData } from '../types/types';
import { transferEventTypes } from '../config/logEventTypes.js';

const parseSwapToken = (tx: TransactionData, web3: AlchemyWeb3, log: Log, logAddress: string) => {
    if (tx.isSwap && transferEventTypes['ERC721'] === log.topics[0]) {
        const receivedAddr = web3.eth.abi.decodeParameter('address', log.topics[2]).toLowerCase();

        tx.tokenId = String(web3.eth.abi.decodeParameter('uint256', log.topics[3]));
        if (logAddress === tx.contractAddress) tx.swap.monitorTokenId = tx.tokenId;

        receivedAddr in tx.swap
            ? tx.swap[receivedAddr].receivedAssets.push({
                  tokenId: tx.tokenId,
                  tokenType: 'ERC721',
                  contractAddress: logAddress
              })
            : (tx.swap[receivedAddr] = {
                  receivedAssets: [
                      { tokenId: tx.tokenId, tokenType: 'ERC721', contractAddress: logAddress }
                  ]
              });
    } else if (tx.isSwap && transferEventTypes['ERC1155'][1] === log.topics[0]) {
        const receivedAddr = web3.eth.abi.decodeParameter('address', log.topics[3]).toLowerCase();
        const decodeData = web3.eth.abi.decodeLog(
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
                      tokenType: 'ERC1155',
                      quantity: Number(decodeData.values[i]),
                      contractAddress: logAddress
                  })
                : (tx.swap[receivedAddr] = {
                      receivedAssets: [
                          {
                              tokenId: decodeData.ids[i],
                              tokenType: 'ERC1155',
                              quantity: Number(decodeData.values[i]),
                              contractAddress: logAddress
                          }
                      ]
                  });
        }
    }
};

export { parseSwapToken };
