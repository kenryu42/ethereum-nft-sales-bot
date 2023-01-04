<div id="top"></div>

![GitHub contributors](https://img.shields.io/github/contributors-anon/kenryu42/ethereum-nft-sales-bot)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/kenryu42/ethereum-nft-sales-bot/run-test.yml?branch=main)
![GitHub issues](https://img.shields.io/github/issues-raw/kenryu42/ethereum-nft-sales-bot)
![GitHub pull requests](https://img.shields.io/github/issues-pr/kenryu42/ethereum-nft-sales-bot)
[![GitHub license](https://img.shields.io/github/license/kenryu42/ethereum-nft-sales-bot)](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/main/LICENSE)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

<div align="center">

  <br />
  <img src="https://i.postimg.cc/2Sw0Bq1C/eth-bot-logo-2.png" alt="Logo" width="800">

  <h3 align="center">Ethereum-NFT-Sales-Bot</h3>

  <p align="center">
    NFT sales monitoring bot for the Ethereum blockchain. (erc721, erc1155)
  </p>
  <br />
  <br />
</div>

## Table of Contents

<details>
  <summary>Click to expand</summary>
  <ol>
    <li><a href="#market-coverage">Market Coverage</a></li>
    <li><a href="#gif-generator">GIF Generator</a></li>
    <li><a href="#live-demo">Live Demo</a></li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#opensea-api-key-is-now-optional">Opensea API Key Is Now Optional</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
      <a href="#configuration">Configuration</a>
      <ul>
        <li><a href="#mandatory">Mandatory</a></li>
        <li><a href="#optional">Optional</a></li>
        <li><a href="#multi-monitoring">Multi Monitoring</a></li>
      </ul>
    </li>
    <li><a href="#update">Update</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#run-test">Run Test</a></li>
    <li><a href="#lint-check">Lint Check</a></li>
    <li>
      <a href="#notify-method">Notify Method</a>
      <ul>
        <li><a href="#twitter-1">Twitter</a></li>
        <li><a href="#discord-1">Discord</a></li>
      </ul>
    </li>
    <li><a href="#mindmap">Mindmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
    <li><a href="#collections">Collections</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>
<br />

## Market Coverage

-   [Opensea](https://opensea.io/)

-   [Looksrare](https://looksrare.org/)

-   [X2Y2](https://x2y2.io/)

-   [Gem](https://gem.xyz/)

-   [Genie](https://www.genie.xyz/)

-   [NFT Trader](https://www.nfttrader.io/)

-   [Sudoswap](https://sudoswap.xyz/#/)

-   [Blur
    <img src="https://cdn-icons-png.flaticon.com/512/891/891449.png" width="20" height="20"/>](https://blur.io/)

<p align="right">(<a href="#top">back to top</a>)</p>

## GIF Generator

![gif_1](https://media2.giphy.com/media/sjKGGbK6CnM3AnJZ25/giphy.gif?cid=790b76110714c67c573d4cc5887b69aa0074c0b663666fbf&rid=giphy.gif&ct=g)
![gif_2](https://media0.giphy.com/media/ajlODzWh2qCuypxT1q/giphy.gif?cid=790b76114a9ed6d608c47cabda6b83300ec036eb7e4c602b&rid=giphy.gif&ct=g)

<br/>
<p align="right">(<a href="#top">back to top</a>)</p>

## Live Demo

<img src="https://i.postimg.cc/bwfk6tFy/nft-sales-bot-banner-002.jpg" alt="Logo" width="800">

### Twitter

-   [Azuki Sales](https://twitter.com/azuki_sale_bot)
-   [BAYC Sales](https://twitter.com/bayc_sales)
-   [Murakami.Flowers Sales](https://twitter.com/mftm_sales)

### Discord

-   [Live Demo Discord Server](https://discord.gg/GjkH7qdP8X)
-   [Murakami.Flowers Discord Server](https://discord.gg/murakamiflowers)

<p align="right">(<a href="#top">back to top</a>)</p>

## Getting Started

### Prerequisites

-   Install [Node.js](https://nodejs.org) version 16.16.0 LTS
    -   If you are using [nvm](https://github.com/creationix/nvm#installation) (recommended) running `nvm use` will automatically choose the right node version for you.
-   Alchemy API Key - [apply here](https://auth.alchemyapi.io/signup)
-   Etherscan API Key - [apply here](https://etherscan.io/register)

### Opensea API Key Is Now Optional

-   The bot now use Alchemy as the default NFT API. [🔗 Learn more](https://docs.alchemy.com/alchemy/enhanced-apis/nft-api)

-   If you set `OPENSEA_API_KEY` in the `.env` file, it will take priority over the Alchemy for NFT API.

### Installation

```bash
npm install
```

<p align="right">(<a href="#top">back to top</a>)</p>

## Configuration

> Create an `.env` file in the root directory of the project with the following contents:

### Mandatory

```
CONTRACT_ADDRESS=
ALCHEMY_API_KEY=
ETHERSCAN_API_KEY=
```

### Optional

```
OPENSEA_API_KEY=
TWITTER_ENABLED=
TWITTER_API_KEY=
TWITTER_API_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=
DISCORD_ENABLED=
WEBHOOK_URL=
```

### Multi Monitoring

For monitoring multiple NFTs at the same time, use `CONTRACT_ADDRESSES` in the `.env` file.

Example:

```
CONTRACT_ADDRESSES=["0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D","0x60E4d786628Fea6478F785A6d7e704777c86a7c6"]
```

If `CONTRACT_ADDRESS` and `CONTRACT_ADDRESSES` are both set, `CONTRACT_ADDRESSES` will take the priority.

<br />

🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

**Do not commit/include your `.env` file in your repository.**

🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨

<p align="right">(<a href="#top">back to top</a>)</p>

## Update

Run the following command to update the source code:

```bash
npm run update
```

## Usage

Run the following command to start the bot:

```bash
npm start
```

To test a certain transaction for debugging purposes, run the following command:

```bash
npm run debug -- <transaction-hash>
```

<p align="right">(<a href="#top">back to top</a>)</p>

## Run Test

To ensure your configuration(`.env`) is correct, run the following command:

```bash
npm test
```

The test should take less than 3 minutes to run. If it fails, either APIs are down or your configuration is incorrect.

<p align="right">(<a href="#top">back to top</a>)</p>

## Lint Check

To format code and fix linting errors, run the following command:

```bash
npm run fix
```

<p align="right">(<a href="#top">back to top</a>)</p>

## Notify Method

-   <a href="#twitter-1">Twitter</a>

-   <a href="#discord-1">Discord</a>

Notification is optional. You can turn it on in the `./.env` file by setting the `TWITTER_ENABLED` or `DISCORD_ENABLED` value to `1`.

For example:

```
TWITTER_ENABLED=1
DISCORD_ENABLED=1
```

<p align="right">(<a href="#top">back to top</a>)</p>

## Twitter

1. Register Twitter developer account with Elevated access. [🔗 Link](https://developer.twitter.com/en/portal/petition/essential/basic-info)
2. Create a development app with OAuth 1.0a read-write permissions. [🔗 Link](https://developer.twitter.com/en/docs/apps/app-permissions)
3. Install [Twurl](https://github.com/twitter/twurl) and run following command:

    ```
    twurl authorize --consumer-key <your-app-key> --consumer-secret <your-app-secret>
    ```

    This will return an URL that you should open up in your browser. Authenticate to Twitter, and then enter the returned PIN back into the terminal.

    This should create a file called `.twurlrc` in your home directory with all the necessary information.

<p align="right">(<a href="#top">back to top</a>)</p>

## Discord

1. Open the Discord channel you want to receive sales event notifications.
2. From the channel menu, select **Edit channel**.
3. Select **Integrations**.
4. Select **Create Webhook**.
5. Enter the name of the bot that will post the message.
6. Copy the URL from the **WEBHOOK URL** field.
7. Click **Save**.

<p align="right">(<a href="#top">back to top</a>)</p>

## Mindmap

-   [x] Add NFT Trader
-   [x] Add Sudo Swap
-   [ ] Add Sudo Swap OTC
-   [x] Add Blur Marketplace
-   [x] Add Blur Swap

<p align="right">(<a href="#top">back to top</a>)</p>

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

For more information on how to contribute, [check out the contributing guide](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/main/CONTRIBUTING.md).

<p align="right">(<a href="#top">back to top</a>)</p>

## Contact

kenryu.eth - [@kenryu42](https://twitter.com/kenryu42) - ken0ryu@gmail.com

<p align="right">(<a href="#top">back to top</a>)</p>

## Acknowledgments

-   [@dsgriffin](https://github.com/dsgriffin) - [NFT Sales Twitter Bot](https://github.com/dsgriffin/nft-sales-twitter-bot)

<p align="right">(<a href="#top">back to top</a>)</p>

## Collections

Collections that using this bot.

Open a Pull Request to add your collection below!

| Collection       | Twitter                                   | Discord                                                |
| ---------------- | ----------------------------------------- | ------------------------------------------------------ |
| Murakami.Flowers | [@MFTMKKUS](https://twitter.com/MFTMKKUS) | [Murakami.Flowers](https://discord.gg/murakamiflowers) |

<p align="right">(<a href="#top">back to top</a>)</p>

## LICENSE

This project is [MIT](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/main/LICENSE) licensed.

<p align="right">(<a href="#top">back to top</a>)</p>
