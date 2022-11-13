import axios from 'axios';
import sharp from 'sharp';
import Jimp from 'jimp-compact';
import { ethers } from 'ethers';
import { Gif } from 'make-a-gif';
import { getTokenData } from './api.js';
import type { SwapData } from '../types';
import type { BigNumberish } from 'ethers';
import type { NftTokenType } from 'alchemy-sdk';
import { ABI, alchemy, IMAGE_SIZE } from '../config/setup.js';

const GIF_DURATION = 1500;
const { width, height } = IMAGE_SIZE;

const resizeImage = async (image: string) => {
    const resizedImage = await Jimp.read(image);
    resizedImage.resize(width, Jimp.AUTO);
    const buffer = await resizedImage.getBufferAsync(Jimp.MIME_PNG);

    return buffer;
};

const createGif = async (
    tokens: BigNumberish[],
    contractAddress: string,
    tokenType: NftTokenType
) => {
    console.log('Creating GIF...');
    const frames = [];

    for (let i = 0; i < tokens.length; i++) {
        const tokenData = await getTokenData(contractAddress, tokens[i], tokenType);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const endsWithSvg = tokenData.image ? tokenData.image.endsWith('.svg') : false;
        const startsWithSvg = tokenData.image
            ? tokenData.image.startsWith('data:image/svg+xml;base64,')
            : false;
        let imageData;

        if (endsWithSvg) {
            const response = await axios.get(tokenData.image ?? '', {
                responseType: 'arraybuffer'
            });
            const buffer = await sharp(response.data).png().toBuffer();
            imageData = buffer;
        } else if (startsWithSvg) {
            const base64Image = (tokenData.image ?? '').replace('data:image/svg+xml;base64,', '');
            const buffer = Buffer.from(base64Image, 'base64');

            imageData = await sharp(buffer).png().toBuffer();
        } else {
            imageData = tokenData.image;
        }

        const tokenIdText = {
            text: `# ${String(tokens[i]).padStart(4, '0')}`,
            alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
            alignmentY: Jimp.VERTICAL_ALIGN_TOP
        };
        const image = !imageData
            ? await createTextImage('Content not available yet')
            : await Jimp.read(imageData);

        image.resize(width, Jimp.AUTO);
        image.print(font, -20, 20, tokenIdText, width, height);
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
        frames.push({ src: buffer, duration: GIF_DURATION });

        if (i === 9 && tokens.length > 10) {
            const textImage = await createTextImage('And more ...');

            textImage.resize(width, Jimp.AUTO);
            const buffer = await textImage.getBufferAsync(Jimp.MIME_PNG);
            frames.push({ src: buffer, duration: GIF_DURATION });
            break;
        }
    }

    const myGif = new Gif(width, height, 100);
    await myGif.setFrames(frames);

    const gifImage = await myGif.encode();
    console.log('GIF created.');

    return gifImage;
};

const createSwapGif = async (swap: SwapData, addressMaker: string, addressTaker: string) => {
    console.log('Creating Swap GIF...');
    const frames = [];
    const image = await Jimp.read('https://i.postimg.cc/qB8cqcM8/nft-trader-logo-black.png');
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const provider = await alchemy.config.getProvider();

    frames.push({ src: buffer, duration: GIF_DURATION });

    for (const address of [addressMaker, addressTaker]) {
        let image = new Jimp(width, height, 'white');
        image = await addTextToImage(image, swap[address].name ?? 'NoName', 0, -25, true);
        const buffer = await addTextToImage(image, 'Received:', 0, 25);

        frames.push({ src: buffer, duration: GIF_DURATION });

        for (const asset of swap[address].receivedAssets) {
            let symbol;
            let imageData;
            const contract = new ethers.Contract(asset.contractAddress, ABI, provider);
            const tokenData = await getTokenData(
                asset.contractAddress,
                asset.tokenId,
                asset.tokenType
            );
            const endsWithSvg = tokenData.image ? tokenData.image.endsWith('.svg') : false;
            const startsWithSvg = tokenData.image
                ? tokenData.image.startsWith('data:image/svg+xml;base64,')
                : false;

            try {
                symbol = await contract.symbol();
            } catch {
                symbol = '';
            }
            const tokenName =
                tokenData.name || `${symbol} #${String(asset.tokenId).padStart(4, '0')}`;

            asset.name = tokenName;

            if (endsWithSvg) {
                const buffer = await axios.get(tokenData.image ?? '', {
                    responseType: 'arraybuffer'
                });

                imageData = await sharp(buffer.data).png().toBuffer();
            } else if (startsWithSvg) {
                const base64Image = tokenData.image ?? ''.replace('data:image/svg+xml;base64,', '');
                const buffer = Buffer.from(base64Image, 'base64');

                imageData = await sharp(buffer).png().toBuffer();
            } else {
                imageData = tokenData.image;
            }

            const image = !imageData
                ? await createTextImage('Content not available yet')
                : await Jimp.read(imageData);
            image.resize(width, Jimp.AUTO);
            const quantity = asset.quantity ?? 0 > 1 ? ` Quantity: ${asset.quantity}` : '';
            const text = `${tokenName}${quantity}`;
            const buffer = await addTextToImage(image, text, -20, 20, false, true);

            frames.push({ src: buffer, duration: GIF_DURATION });
        }
        if (parseFloat(swap[address].receivedAmount ?? '0') > 0) {
            const image = new Jimp(width, height, 'white');
            const buffer = await addTextToImage(image, `${swap[address].receivedAmount} ETH`, 0, 0);

            frames.push({ src: buffer, duration: GIF_DURATION });
        } else if (!swap[address].receivedAssets) {
            const image = new Jimp(width, height, 'white');
            const buffer = await addTextToImage(image, 'Nothing 🫡', 0, 0);

            frames.push({ src: buffer, duration: GIF_DURATION });
        }
    }

    const myGif = new Gif(width, height, 100);
    await myGif.setFrames(frames);
    const gifImage = await myGif.encode();

    console.log('Swap GIF created.');

    return gifImage;
};

const addTextToImage = async (
    image: Jimp,
    text: string,
    x: number,
    y: number,
    jimp = false,
    idText = false
) => {
    const font = await Jimp.loadFont(idText ? Jimp.FONT_SANS_32_WHITE : Jimp.FONT_SANS_32_BLACK);
    const textObject = {
        text: text,
        alignmentX: idText ? Jimp.HORIZONTAL_ALIGN_RIGHT : Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: idText ? Jimp.VERTICAL_ALIGN_TOP : Jimp.VERTICAL_ALIGN_MIDDLE
    };
    image.print(font, x, y, textObject, width, height);
    if (jimp) return image;
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

    return buffer;
};

const createTextImage = async (text: string, getBuffer = false) => {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const image = new Jimp(width, height, 'white');
    const naText = {
        // text: 'Content not available yet',
        text: text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    };
    image.print(font, 0, 0, naText, width, height);
    if (getBuffer) {
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

        return buffer;
    }

    return image;
};

export { createGif, createSwapGif, createTextImage, resizeImage };
