import axios from 'axios';
import sharp from 'sharp';
import sizeOf from 'image-size';
import Jimp from 'jimp-compact';
import { ethers } from 'ethers';
import { Gif } from 'make-a-gif';
import { getTokenData, readImageData } from './api.js';
import { ABI, alchemy, IMAGE_WIDTH, GIF_DURATION } from '../config/setup.js';

import type { BigNumberish } from 'ethers';
import type { SwapData, TokenData } from '../types';
import type { AlchemyProvider, NftTokenType } from 'alchemy-sdk';

const resizeImage = async (image: string) => {
    const resizedImage = await readImageData(image);
    resizedImage.resize(IMAGE_WIDTH, Jimp.AUTO);
    const buffer = await resizedImage.getBufferAsync(Jimp.MIME_PNG);

    return buffer;
};

const generateDynamicHeight = (buffer: string | Buffer) => {
    const dimensions = sizeOf(buffer);
    const imageWidth = dimensions.width ?? 1;
    const imageHeight = dimensions.height ?? 0;

    return Math.round((imageHeight / imageWidth) * IMAGE_WIDTH);
};

const parseImage = async (tokenData: TokenData) => {
    let imageData;
    const endsWithSvg = tokenData.image ? tokenData.image.endsWith('.svg') : false;
    const startsWithSvg = tokenData.image
        ? tokenData.image.startsWith('data:image/svg+xml;base64,')
        : false;

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

    return imageData;
};

const getSymbolName = async (contractAddress: string, provider: AlchemyProvider) => {
    const contract = new ethers.Contract(contractAddress, ABI, provider);

    try {
        return await contract.symbol();
    } catch {
        return '';
    }
};

const createGif = async (
    tokens: BigNumberish[],
    contractAddress: string,
    tokenType: NftTokenType
) => {
    console.log('Creating GIF...');
    const frames = [];
    let dynamicHeight = 0;

    for (let i = 0; i < tokens.length; i++) {
        const tokenData = await getTokenData(contractAddress, tokens[i], tokenType);
        const imageData = await parseImage(tokenData);
        const image = !imageData
            ? await createTextImage('Content not available yet')
            : await readImageData(imageData);

        image.resize(IMAGE_WIDTH, Jimp.AUTO);
        const idText = `# ${String(tokens[i]).padStart(4, '0')}`;
        const buffer = await addTextToImage(image, idText, -20, 20, false, true);

        if (!dynamicHeight) {
            dynamicHeight = generateDynamicHeight(buffer);
        }
        frames.push({ src: buffer, duration: GIF_DURATION });

        if (i === 9 && tokens.length > 10) {
            const textImage = await createTextImage('And more ...');

            textImage.resize(IMAGE_WIDTH, Jimp.AUTO);
            const buffer = await textImage.getBufferAsync(Jimp.MIME_PNG);
            frames.push({ src: buffer, duration: GIF_DURATION });
            break;
        }
    }

    const myGif = new Gif(IMAGE_WIDTH, dynamicHeight, 100);
    await myGif.setFrames(frames);

    const gifImage = await myGif.encode();
    console.log('GIF created.');

    return gifImage;
};

const createSwapGif = async (swap: SwapData, addressMaker: string, addressTaker: string) => {
    console.log('Creating Swap GIF...');
    let dynamicHeight;
    const frames = [];
    const image = await readImageData('https://i.postimg.cc/qB8cqcM8/nft-trader-logo-black.png');
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const provider = await alchemy.config.getProvider();

    frames.push({ src: buffer, duration: GIF_DURATION });

    for (const address of [addressMaker, addressTaker]) {
        let image = new Jimp(IMAGE_WIDTH, IMAGE_WIDTH, 'white');
        image = await addTextToImage(image, swap[address].name ?? 'NoName', 0, -25, true);
        const buffer = await addTextToImage(image, 'Received:', 0, 25);

        frames.push({ src: buffer, duration: GIF_DURATION });

        for (const asset of swap[address].receivedAssets) {
            const symbol = await getSymbolName(asset.contractAddress, provider);
            const tokenData = await getTokenData(
                asset.contractAddress,
                asset.tokenId,
                asset.tokenType
            );
            const imageData = await parseImage(tokenData);
            const image = !imageData
                ? await createTextImage('Content not available yet')
                : await readImageData(imageData);
            const bufferAsync = await image.getBufferAsync(Jimp.MIME_PNG);
            const quantityText = asset.quantity ?? 0 > 1 ? ` Quantity: ${asset.quantity}` : '';

            dynamicHeight = generateDynamicHeight(bufferAsync);
            image.resize(IMAGE_WIDTH, dynamicHeight);
            const buffer = await addTextToImage(image, quantityText, -20, 20, false, true);
            frames.push({ src: buffer, duration: GIF_DURATION });
            asset.name = tokenData.name || `${symbol} #${String(asset.tokenId).padStart(4, '0')}`;
        }
        if (parseFloat(swap[address].receivedAmount ?? '0') > 0) {
            const image = new Jimp(IMAGE_WIDTH, IMAGE_WIDTH, 'white');
            const buffer = await addTextToImage(image, `${swap[address].receivedAmount} ETH`, 0, 0);

            frames.push({ src: buffer, duration: GIF_DURATION });
        } else if (!swap[address].receivedAssets) {
            const image = new Jimp(IMAGE_WIDTH, IMAGE_WIDTH, 'white');
            const buffer = await addTextToImage(image, 'Nothing 🫡', 0, 0);

            frames.push({ src: buffer, duration: GIF_DURATION });
        }
    }

    const myGif = new Gif(IMAGE_WIDTH, dynamicHeight ?? IMAGE_WIDTH, 100);
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
    image.print(font, x, y, textObject, IMAGE_WIDTH, IMAGE_WIDTH);
    if (jimp) return image;
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

    return buffer;
};

const createTextImage = async (text: string, getBuffer = false) => {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const image = new Jimp(IMAGE_WIDTH, IMAGE_WIDTH, 'white');
    const naText = {
        // text: 'Content not available yet',
        text: text,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    };
    image.print(font, 0, 0, naText, IMAGE_WIDTH, IMAGE_WIDTH);
    if (getBuffer) {
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

        return buffer;
    }

    return image;
};

export { createGif, createSwapGif, createTextImage, resizeImage };
