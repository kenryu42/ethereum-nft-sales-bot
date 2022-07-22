import { transferEventTypes } from '../config/logEventTypes.js';

const parseSwapToken = ({ web3, log, logAddress, isSwap, swap, tokenId, contractAddress }) => {
    if (isSwap && transferEventTypes['ERC721'] === log.topics[0]) {
        const receivedAddr = web3.eth.abi.decodeParameter('address', log.topics[2]).toLowerCase();

        tokenId = web3.eth.abi.decodeParameter('uint256', log.topics[3]);
        if (logAddress === contractAddress) swap.monitorTokenId = tokenId;

        receivedAddr in swap
            ? swap[receivedAddr].receivedAssets.push({
                  tokenId: tokenId,
                  tokenType: 'ERC721',
                  contractAddress: logAddress
              })
            : (swap[receivedAddr] = {
                  receivedAssets: [
                      { tokenId: tokenId, tokenType: 'ERC721', contractAddress: logAddress }
                  ]
              });
    } else if (isSwap && transferEventTypes['ERC1155'][1] === log.topics[0]) {
        const receivedAddr = web3.eth.abi.decodeParameter('address', log.topics[3]).toLowerCase();
        const decodeData = web3.eth.abi.decodeLog(
            [
                { type: 'uint256[]', name: 'ids' },
                { type: 'uint256[]', name: 'values' }
            ],
            log.data,
            []
        );

        tokenId = decodeData.ids[0];
        if (logAddress === contractAddress) swap.monitorTokenId = tokenId;

        for (let i = 0; i < decodeData.ids.length; i++) {
            receivedAddr in swap
                ? swap[receivedAddr].receivedAssets.push({
                      tokenId: decodeData.ids[i],
                      tokenType: 'ERC1155',
                      quantity: decodeData.values[i],
                      contractAddress: logAddress
                  })
                : (swap[receivedAddr] = {
                      receivedAssets: [
                          {
                              tokenId: decodeData.ids[i],
                              tokenType: 'ERC1155',
                              quantity: decodeData.values[i],
                              contractAddress: logAddress
                          }
                      ]
                  });
        }
    }

    return tokenId;
};

export { parseSwapToken };
