import type { Market } from '../types';

const markets: { [key: string]: Market } = {
    // Sudoswap Pair Router Address
    '0x2b2e8cda09bba9660dca5cb6233787738ad68329': {
        name: 'sudoswap',
        displayName: 'Sudoswap',
        color: '#b6b9fe',
        site: 'https://opensea.io/assets/',
        accountPage: 'https://opensea.io/',
        iconURL: 'https://pbs.twimg.com/profile_images/1542272594686054401/vOi42ixp_400x400.jpg',
        logDecoder: []
    },
    // NFT Trader BatchSwap Address
    '0x657e383edb9a7407e468acbcc9fe4c9730c7c275': {
        name: 'nft-trader',
        displayName: 'NFT Trader 🔄',
        color: '#dbff00',
        site: 'https://etherscan.io/tx/',
        accountPage: 'https://opensea.io/',
        iconURL: 'https://pbs.twimg.com/profile_images/1538537469779623937/pHkL_wiw_400x400.png',
        logDecoder: [
            {
                type: 'uint256',
                name: '_swapId'
            },
            {
                type: 'address',
                name: '_counterPart'
            },
            {
                type: 'address',
                name: '_referral'
            }
        ]
    },
    // GemSwap Contract Address
    '0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2': {
        name: 'gem',
        displayName: 'Gem 💎',
        color: '#f07a9d',
        site: 'https://www.gem.xyz/asset/',
        accountPage: 'https://www.gem.xyz/profile/',
        iconURL: 'https://pbs.twimg.com/profile_images/1469735318488293380/AuOdfwvH_400x400.jpg'
    },
    // Gem Single Contract Checkout 1 Address
    '0x0000000031f7382a812c64b604da4fc520afef4b': {
        name: 'gem',
        displayName: 'Gem 💎',
        color: '#f07a9d',
        site: 'https://www.gem.xyz/asset/',
        accountPage: 'https://www.gem.xyz/profile/',
        iconURL: 'https://pbs.twimg.com/profile_images/1469735318488293380/AuOdfwvH_400x400.jpg'
    },
    // Gem Single Contract Checkout 2 Address
    '0x0000000035634b55f3d99b071b5a354f48e10bef': {
        name: 'gem',
        displayName: 'Gem 💎',
        color: '#f07a9d',
        site: 'https://www.gem.xyz/asset/',
        accountPage: 'https://www.gem.xyz/profile/',
        iconURL: 'https://pbs.twimg.com/profile_images/1469735318488293380/AuOdfwvH_400x400.jpg'
    },
    // Gem Single Contract Checkout 3 Address
    '0x00000000a50bb64b4bbeceb18715748dface08af': {
        name: 'gem',
        displayName: 'Gem 💎',
        color: '#f07a9d',
        site: 'https://www.gem.xyz/asset/',
        accountPage: 'https://www.gem.xyz/profile/',
        iconURL: 'https://pbs.twimg.com/profile_images/1469735318488293380/AuOdfwvH_400x400.jpg'
    },
    // Gem Single Contract Checkout 4 Address
    '0xae9c73fd0fd237c1c6f66fe009d24ce969e98704': {
        name: 'gem',
        displayName: 'Gem 💎',
        color: '#f07a9d',
        site: 'https://www.gem.xyz/asset/',
        accountPage: 'https://www.gem.xyz/profile/',
        iconURL: 'https://pbs.twimg.com/profile_images/1469735318488293380/AuOdfwvH_400x400.jpg'
    },
    // GenieSwap Contract Address
    '0x0a267cf51ef038fc00e71801f5a524aec06e4f07': {
        name: 'genie',
        displayName: 'Genie 🧞‍♂️',
        color: '#ffffff',
        site: 'https://opensea.io/assets/',
        accountPage: 'https://opensea.io/',
        iconURL: 'https://pbs.twimg.com/profile_images/1486044157017788419/cqdhpZBX_400x400.png'
    },
    // X2Y2 Contract Address
    '0x74312363e45dcaba76c59ec49a7aa8a65a67eed3': {
        name: 'x2y2',
        displayName: 'X2Y2 ⭕️',
        color: '#00e0ff',
        site: 'https://x2y2.io/eth/',
        accountPage: 'https://x2y2.io/user/',
        iconURL: 'https://pbs.twimg.com/profile_images/1482386069891198978/mMFwXNj8_400x400.jpg',
        logDecoder: [
            {
                type: 'bytes32',
                name: 'itemHash'
            },
            {
                type: 'address',
                name: 'currency'
            },
            {
                type: 'address',
                name: 'to'
            },
            {
                type: 'uint256',
                name: 'amount'
            }
        ]
    },
    // LooksRareExchange Contract Address
    '0x59728544b08ab483533076417fbbb2fd0b17ce3a': {
        name: 'looksrare',
        displayName: 'LooksRare 👀💎',
        color: '#0ce465',
        site: 'https://looksrare.org/collections/',
        accountPage: 'https://looksrare.org/accounts/',
        iconURL: 'https://pbs.twimg.com/profile_images/1493172984240308225/Nt6RFdmb_400x400.jpg',
        logDecoder: [
            {
                type: 'bytes32',
                name: 'orderHash'
            },
            {
                type: 'uint256',
                name: 'orderNonce'
            },
            {
                type: 'address',
                name: 'currency'
            },
            {
                type: 'address',
                name: 'collection'
            },
            {
                type: 'uint256',
                name: 'tokenId'
            },
            {
                type: 'uint256',
                name: 'amount'
            },
            {
                type: 'uint256',
                name: 'price'
            }
        ]
    },
    // Opensea Seaport Protocol Contract Address
    '0x00000000006c3852cbef3e08e8df289169ede581': {
        name: 'opensea',
        displayName: 'Opensea: Seaport ⚓️',
        color: '#399dff',
        site: 'https://opensea.io/assets/',
        accountPage: 'https://opensea.io/',
        iconURL: 'https://pbs.twimg.com/profile_images/1537131404550582272/TvRw2kcG_400x400.jpg',
        logDecoder: [
            {
                type: 'bytes32',
                name: 'orderHash'
            },
            {
                type: 'address',
                name: 'recipient'
            },
            {
                type: 'tuple[]',
                name: 'offer',
                components: [
                    {
                        type: 'uint8',
                        name: 'itemType'
                    },
                    {
                        type: 'address',
                        name: 'token'
                    },
                    {
                        type: 'uint256',
                        name: 'identifier'
                    },
                    {
                        type: 'uint256',
                        name: 'amount'
                    }
                ]
            },
            {
                type: 'tuple[]',
                name: 'consideration',
                components: [
                    {
                        type: 'uint8',
                        name: 'itemType'
                    },
                    {
                        type: 'address',
                        name: 'token'
                    },
                    {
                        type: 'uint256',
                        name: 'identifier'
                    },
                    {
                        type: 'uint256',
                        name: 'amount'
                    },
                    {
                        type: 'address',
                        name: 'recipient'
                    }
                ]
            }
        ]
    },
    '0x0804b76278eac7c719ee7b7921b3f1071d1ae2f7': {
        name: 'opensea',
        displayName: 'Opensea: Seaport ⚓️',
        color: '#399dff',
        site: 'https://opensea.io/assets/',
        accountPage: 'https://opensea.io/',
        iconURL: 'https://pbs.twimg.com/profile_images/1537131404550582272/TvRw2kcG_400x400.jpg',
        logDecoder: [
            {
                type: 'bytes32',
                name: 'orderHash'
            },
            {
                type: 'address',
                name: 'recipient'
            },
            {
                type: 'tuple[]',
                name: 'offer',
                components: [
                    {
                        type: 'uint8',
                        name: 'itemType'
                    },
                    {
                        type: 'address',
                        name: 'token'
                    },
                    {
                        type: 'uint256',
                        name: 'identifier'
                    },
                    {
                        type: 'uint256',
                        name: 'amount'
                    }
                ]
            },
            {
                type: 'tuple[]',
                name: 'consideration',
                components: [
                    {
                        type: 'uint8',
                        name: 'itemType'
                    },
                    {
                        type: 'address',
                        name: 'token'
                    },
                    {
                        type: 'uint256',
                        name: 'identifier'
                    },
                    {
                        type: 'uint256',
                        name: 'amount'
                    },
                    {
                        type: 'address',
                        name: 'recipient'
                    }
                ]
            }
        ]
    }
};

export { markets };
