## Ethereum NFT Sales Bot

NFT sales monitoring bot of the Ethereum blockchain. (ERC721, ERC1155)

[![GitHub license](https://img.shields.io/github/license/kenryu42/ethereum-nft-sales-bot)](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/main/LICENSE)
![GitHub branch checks state](https://img.shields.io/github/checks-status/kenryu42/ethereum-nft-sales-bot/main)

## Market Coverage

- [Opensea](https://opensea.io/)
  <img src="https://pbs.twimg.com/profile_images/1533843334946508806/kleAruEh_400x400.png" width="13"/>
  (Wyvren & Seaport)

- [Looksrare](https://looksrare.org/)
  <img src="https://pbs.twimg.com/profile_images/1493172984240308225/Nt6RFdmb_400x400.jpg" width="13"/>

- [X2Y2](https://x2y2.io/)
  <img src="https://pbs.twimg.com/profile_images/1482386069891198978/mMFwXNj8_400x400.jpg" width="13"/>

- [Gem](https://gem.xyz/)
  <img src="https://pbs.twimg.com/profile_images/1469735318488293380/AuOdfwvH_400x400.jpg" width="13"/>

- [Genie](https://www.genie.xyz/)
  <img src="https://pbs.twimg.com/profile_images/1486044157017788419/cqdhpZBX_400x400.png" width="13"/>

## GIF Generator for Bundle Sale

<img src="https://media2.giphy.com/media/sjKGGbK6CnM3AnJZ25/giphy.gif?cid=790b76110714c67c573d4cc5887b69aa0074c0b663666fbf&rid=giphy.gif&ct=g" />

<br/>

## Prerequisites

- Opensea API Key - [apply here](https://docs.opensea.io/reference/request-an-api-key)
- Alchemy API Key - [apply here](https://auth.alchemyapi.io/signup)
- Etherscan API Key - [apply here](https://etherscan.io/register)

## Notify Method

- Twitter

- Discord

Notification is optional. You can turn it on in the `./.env` file.

For example:

```
TWITTER_ENABLED=1
DISCORD_ENABLED=1
```

`config/setup.js` (Default is off).

## Twitter Guide

1. Register Twitter developer account with Elevated access. [🔗 Link](https://developer.twitter.com/en/portal/petition/essential/basic-info)
2. Create a development app with OAuth 1.0a read-write permissions. [🔗 Link](https://developer.twitter.com/en/docs/apps/app-permissions)
3. Install [Twurl](https://github.com/twitter/twurl) and run following command:

   ```
   twurl authorize --consumer-key <your-app-key> --consumer-secret <your-app-secret>
   ```

   This will return an URL that you should open up in your browser. Authenticate to Twitter, and then enter the returned PIN back into the terminal.

   This should create a file called `.twurlrc` in your home directory with all the necessary information.

## Discord Guide

1. Open the Discord channel you want to receive sales event notifications.
2. From the channel menu, select **Edit channel**.
3. Select **Integrations**.
4. Select **Create Webhook**.
5. Enter the name of the bot that will post the message.
6. Copy the URL from the **WEBHOOK URL** field.
7. Click **Save**.

## Configuration

> Create an `.env` file in the root directory of the project with the following contents:

```
CONTRACT_ADDRESS=
OPENSEA_API_KEY=
ALCHEMY_API_KEY=
ETHERSCAN_API_KEY=
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=
WEBHOOK_URL=
```

**Do not commit/include your .env file in your repository.**

## Installation

```bash
npm install
```

## Run Test

To ensure your configuration(`.env`) is correct, run the following command:

```bash
npm test
```

The test should take less than a minute to run. If it fails, please check your configuration.

## Usage

Run the following command to start the bot:

```bash
node app.js
```

To test a certain transaction for debugging purposes, run the following command:

```
node app.js -t <transaction hash>
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Credits

**Daniel Griffin** @dsgriffin

[NFT Sales Twitter Bot](https://github.com/dsgriffin/nft-sales-twitter-bot)

## LICENSE

This project is [MIT](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/main/LICENSE) licensed.
