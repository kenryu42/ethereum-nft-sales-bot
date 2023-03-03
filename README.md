<div id="top"></div>

![GitHub contributors](https://img.shields.io/github/contributors-anon/kenryu42/ethereum-nft-sales-bot)
[![CI](https://github.com/kenryu42/ethereum-nft-sales-bot/actions/workflows/CI.yml/badge.svg)](https://github.com/kenryu42/ethereum-nft-sales-bot/actions/workflows/CI.yml)
[![CodeQL](https://github.com/kenryu42/ethereum-nft-sales-bot/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/kenryu42/ethereum-nft-sales-bot/actions/workflows/github-code-scanning/codeql)
[![Release](https://github.com/kenryu42/ethereum-nft-sales-bot/actions/workflows/release.yml/badge.svg)](https://github.com/kenryu42/ethereum-nft-sales-bot/actions/workflows/release.yml)

<div align="center">

  <br />
  <img src="https://i.postimg.cc/R0NZ2P4q/enft-logo2.png" alt="Logo" width="800">

  <h3 align="center">Ethereum NFT</h3>

  <p align="center">
    Ethereum NFT sale events monitoring SDK with built-in Discord and Twitter notification.
  </p>
  <br />
  <br />
</div>

# Table of Contents

<details>
  <summary>Click to expand</summary>
  <ol>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#optional">Optional</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li>
      <a href="#usage">Usage</a>
      <ul>
        <li><a href="#docs">Docs</a></li>
      </ul>
    </li>
    <li>
      <a href="#built-in-notification">Built-in Notification</a>
      <ul>
        <li><a href="#twitter-1">Twitter</a></li>
        <li><a href="#discord-1">Discord</a></li>
      </ul>
    </li>
    <li><a href="#market-coverage">Market Coverage</a></li>
    <li><a href="#live-demo">Live Demo</a></li>
    <li><a href="#unsupported-features">Unsupported Features</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#collections">Collections</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>
<br />

# Getting Started

## Installation

```bash
npm install enft
```

## Prerequisites

-   Support [Node.js](https://nodejs.org) version >= 18
-   Alchemy API Key - [apply here](https://auth.alchemyapi.io/signup) (**Recommended**)
-   **OR**
-   Infura NFT (Open Beta) API Key and API Key Secret - [apply here](https://www.infura.io/resources/apis/nft-api-beta-signup)
-   [fontconfig](https://www.freedesktop.org/software/fontconfig/fontconfig-user.html) is also required for generating image with text. If your system doesn't have it, please install it first.

**Ubuntu/Debian:**

```bash
sudo apt-get install fontconfig
```

**Fedora/RHEL/CentOS:**

```bash
sudo yum install fontconfig
```

**Arch Linux:**

```bash
sudo pacman -S fontconfig
```

**MacOS (Homebrew):**

```bash
brew install fontconfig
```

**Windows (Chocolatey):**

```bash
choco install fontconfig
```

## Optional

-   Etherscan API Key for enabling ETH to USD conversion - [apply here](https://etherscan.io/register)

<p align="right">(<a href="#top">back to top</a>)</p>

# Usage

Subscribe to NFT sales events by calling `onItemSold` method.

```javascript
import { Auth, ENFT } from 'enft';

const auth = {
    alchemy: {
        apiKey: 'YOUR_ALCHEMY_API_KEY'
    }
};

const enft = new ENFT(auth);

enft.onItemSold({
    contractAddress: 'NFT_CONTRACT_ADDRESS',
    discordWebhook: 'DISCORD_WEBHOOK_URL', // optional
    etherscanApiKey: 'ETHERSCAN_API_KEY' // optional
});
```

To debug a specific transaction, call `debugTransaction` method.

```javascript
enft.debugTransaction(
    {
        transactionHash: 'THE_TRANSACTION_HASH_TO_DEBUG',
        contractAddress: 'NFT_CONTRACT_ADDRESS',
        discordWebhook: 'DISCORD_WEBHOOK_URL' // optional
    },
    (txData) => {
        console.log(txData);
    }
);
```

For more concise example, please refer to [Example](https://github.com/kenryu42/ethereum-nft-sales-bot/tree/main/example).

## Docs

See the [auto-generated docs](https://github.com/kenryu42/ethereum-nft-sales-bot/tree/main/docs/classes/ENFT.md) for more info on methods and parameters.

<p align="right">(<a href="#top">back to top</a>)</p>

# Built-in Notification

Notification is optional. You can enabling it by setting the coresponding argument when calling `onItemSold` method.

```javascript
enft.onItemSold({
    discordWebhook: 'YOUR_DISCORD_WEBHOOK_URL',
    twitterConfig: {
        appKey: 'YOUR_TWITTER_APP_KEY',
        appSecret: 'YOUR_TWITTER_APP_SECRET',
        accessToken: 'YOUR_TWITTER_ACCESS_TOKEN',
        accessSecret: 'YOUR_TWITTER_ACCESS_SECRET'
    }
});
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

# Market Coverage

<img src="https://i.postimg.cc/2Sw0Bq1C/eth-bot-logo-2.png" alt="Logo" width="800">

-   [Opensea](https://opensea.io/)

-   [Looksrare](https://looksrare.org/)

-   [X2Y2](https://x2y2.io/)

-   [Gem](https://gem.xyz/)

-   [Genie](https://www.genie.xyz/)

-   [NFT Trader](https://www.nfttrader.io/)

-   [Sudoswap](https://sudoswap.xyz/#/)

-   [Blur](https://blur.io/)

<p align="right">(<a href="#top">back to top</a>)</p>

# Live Demo

<img src="https://i.postimg.cc/bwfk6tFy/nft-sales-bot-banner-002.jpg" alt="Logo" width="800">

![gif_1](https://media2.giphy.com/media/sjKGGbK6CnM3AnJZ25/giphy.gif?cid=790b76110714c67c573d4cc5887b69aa0074c0b663666fbf&rid=giphy.gif&ct=g)
![gif_2](https://media0.giphy.com/media/ajlODzWh2qCuypxT1q/giphy.gif?cid=790b76114a9ed6d608c47cabda6b83300ec036eb7e4c602b&rid=giphy.gif&ct=g)

## Twitter

-   [ENFT SDK](https://twitter.com/enft_sdk)

## Discord

-   [Live Demo Discord Server](https://discord.gg/GjkH7qdP8X)
-   [Murakami.Flowers Discord Server](https://discord.gg/murakamiflowers)

<p align="right">(<a href="#top">back to top</a>)</p>

# Unsupported Features

-   [ ] Uniswap
-   [ ] Sudo Swap OTC

Any contributions are welcome!

<p align="right">(<a href="#top">back to top</a>)</p>

# Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

For more information on how to contribute, [check out the contributing guide](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/main/CONTRIBUTING.md).

<p align="right">(<a href="#top">back to top</a>)</p>

# Contact

kenryu.eth - [@kenryu42](https://twitter.com/kenryu42) - ken0ryu@gmail.com

<p align="right">(<a href="#top">back to top</a>)</p>

# Collections

Collections that using this bot.

Open a Pull Request to add your collection below.

| Collection       | Twitter                                   | Discord                                                |
| ---------------- | ----------------------------------------- | ------------------------------------------------------ |
| Murakami.Flowers | [@MFTMKKUS](https://twitter.com/MFTMKKUS) | [Murakami.Flowers](https://discord.gg/murakamiflowers) |

<p align="right">(<a href="#top">back to top</a>)</p>

# LICENSE

This project is [MIT](https://github.com/kenryu42/ethereum-nft-sales-bot/blob/main/LICENSE) licensed.

<p align="right">(<a href="#top">back to top</a>)</p>
