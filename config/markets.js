const markets = {
	// GemSwap Contract Address
	'0x83c8f28c26bf6aaca652df1dbbe0e1b56f8baba2': {
		name: 'Gem.XYZ 💎',
		color: '#f07a9d',
		site: 'https://www.gem.xyz/asset/',
		account_site: 'https://www.gem.xyz/profile/',
		iconURL:
			'https://pbs.twimg.com/profile_images/1469735318488293380/AuOdfwvH_400x400.jpg'
	},
	// Gem Single Contract Checkout 1 Address
	'0x0000000031f7382a812c64b604da4fc520afef4b': {
		name: 'Gem.XYZ 💎',
		color: '#f07a9d',
		site: 'https://www.gem.xyz/asset/',
		account_site: 'https://www.gem.xyz/profile/',
		iconURL:
			'https://pbs.twimg.com/profile_images/1469735318488293380/AuOdfwvH_400x400.jpg'
	},
	// Gem Single Contract Checkout 2 Address
	'0x0000000035634b55f3d99b071b5a354f48e10bef': {
		name: 'Gem.XYZ 💎',
		color: '#f07a9d',
		site: 'https://www.gem.xyz/asset/',
		account_site: 'https://www.gem.xyz/profile/',
		iconURL:
			'https://pbs.twimg.com/profile_images/1469735318488293380/AuOdfwvH_400x400.jpg'
	},
	// Gem Single Contract Checkout 3 Address
	'0x00000000a50bb64b4bbeceb18715748dface08af': {
		name: 'Gem.XYZ 💎',
		color: '#f07a9d',
		site: 'https://www.gem.xyz/asset/',
		account_site: 'https://www.gem.xyz/profile/',
		iconURL:
			'https://pbs.twimg.com/profile_images/1469735318488293380/AuOdfwvH_400x400.jpg'
	},
	// Gem Single Contract Checkout 4 Address
	'0xae9c73fd0fd237c1c6f66fe009d24ce969e98704': {
		name: 'Gem.XYZ 💎',
		color: '#f07a9d',
		site: 'https://www.gem.xyz/asset/',
		account_site: 'https://www.gem.xyz/profile/',
		iconURL:
			'https://pbs.twimg.com/profile_images/1469735318488293380/AuOdfwvH_400x400.jpg'
	},
	// GenieSwap Contract Address
	'0x0a267cf51ef038fc00e71801f5a524aec06e4f07': {
		name: 'Genie 🧞‍♂️',
		color: '#ffffff',
		site: 'https://opensea.io/assets/',
		account_site: 'https://opensea.io/',
		iconURL:
			'https://pbs.twimg.com/profile_images/1486044157017788419/cqdhpZBX_400x400.png'
	},
	// X2Y2 Contract Address
	'0x74312363e45dcaba76c59ec49a7aa8a65a67eed3': {
		name: 'X2Y2 ⭕️',
		color: '#00e0ff',
		site: 'https://x2y2.io/eth/',
		account_site: 'https://x2y2.io/user/',
		iconURL:
			'https://pbs.twimg.com/profile_images/1482386069891198978/mMFwXNj8_400x400.jpg',
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
	// OpenSea Contract Address
	'0x7f268357a8c2552623316e2562d90e642bb538e5': {
		name: 'OpenSea: Wyvern 🌊',
		color: '#2484e4',
		site: 'https://opensea.io/assets/',
		account_site: 'https://opensea.io/',
		iconURL:
			'https://pbs.twimg.com/profile_images/1533843334946508806/kleAruEh_400x400.png',
		logDecoder: [
			{
				type: 'bytes32',
				name: 'buyHash'
			},
			{
				type: 'bytes32',
				name: 'sellHash'
			},
			{
				type: 'uint256',
				name: 'price'
			}
		]
	},
	// LooksRareExchange Contract Address
	'0x59728544b08ab483533076417fbbb2fd0b17ce3a': {
		name: 'LooksRare 👀💎',
		color: '#0ce465',
		site: 'https://looksrare.org/collections/',
		account_site: 'https://looksrare.org/accounts/',
		iconURL:
			'https://pbs.twimg.com/profile_images/1493172984240308225/Nt6RFdmb_400x400.jpg',
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
	'0x00000000006c3852cbef3e08e8df289169ede581': {
		name: 'Opensea: Seaport ⚓️',
		color: '#399dff',
		site: 'https://opensea.io/assets/',
		account_site: 'https://opensea.io/',
		iconURL:
			'https://pbs.twimg.com/profile_images/1537131404550582272/TvRw2kcG_400x400.jpg',
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
