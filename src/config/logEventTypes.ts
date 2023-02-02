const transferEventTypes = {
    ERC721: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer
    ERC1155: [
        '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62', // TransferSingle
        '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb' // TransferBatch
    ]
};

const saleEventTypes = [
    '0xe2c49856b032c255ae7e325d18109bc4e22a2804e2e49a017ec0f59f19cd447b', // EvProfit (X2Y2)
    '0x95fb6205e23ff6bda16a2d1dba56b9ad7c783f67c96fa149785052f47696f2be', // TakerBid (LooksRare)
    '0x68cd251d4d267c6e2034ff0088b990352b97b2002c0476587d0c4da889c11330', // TakerAsk (LooksRare)
    '0x9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31', // OrderFulfilled (Seaport)
    '0x8873f53f40d4865bac9c1e8998aef3351bb1ef3db1a6923ab09621cf1a6659a9', // swapEvent (NFT Trader)
    '0x61cbb2a3dee0b6064c2e681aadd61677fb4ef319f0b547508d495626f5a62f64' // OrdersMatched (Blur)
];

const doopEventTypes = [
    '0x7129989d8fa402381eff23a98149e58d94429ba7921e5b5f2f0b00d8715c21a0', // Dooplicate (Both)
    '0xd9599929b4f30375cdc70108bf8dd0ca57d73ccfbb9cca5639124233b41ebe86' // ItemDooplicated (Marketplace)
];

export { transferEventTypes, saleEventTypes, doopEventTypes };
