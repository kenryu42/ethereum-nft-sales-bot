import axios from 'axios';
import sharp from 'sharp';
import retry from 'async-retry';
import pkg from 'gifenc';
import { getNftMetadata } from '../api/api.js';
import { getSymbolName } from '../utils/helper.js';
import { Logger, log } from '../Logger/index.js';

import type { Swap } from '../types/contracts/swap.contract';
import type { Config } from '../types/interfaces/enft.interface';
import type { TokenData } from '../types/contracts/token.contract.js';

interface GifConfig {
    gif: pkg.Encoder;
    imageBuffer: Buffer | Uint8Array;
}

const API_CALL_LIMIT = 10;
const IMAGE_WIDTH = 512;
const { GIFEncoder, quantize, applyPalette } = pkg;

/**
 *
 * A function that parses and returns sharp instance image.
 *
 * @async
 * @function
 * @param {string} image - The image url or raw data to be parsed.
 * @returns {Promise<sharp.Sharp>} A sharp object containing the parsed image.
 **/
const parseImage = async (image: string): Promise<sharp.Sharp> => {
    const isBase64Image = image.startsWith('data:image/svg+xml;base64,');

    if (isBase64Image) {
        const svgImage = image.replace('data:image/svg+xml;base64,', '');
        const buffer = Buffer.from(svgImage, 'base64');

        return sharp(buffer);
    } else {
        const arrayBuffer = await getArrayBuffer(image);

        return sharp(arrayBuffer, { animated: true });
    }
};

/**
 *
 * Creates a GIF from an Object of tokens.
 *
 * @async
 * @function
 * @param {TokenData} tokens - An object containing token data.
 * @returns {Promise<Buffer>} A buffer object that contains the finalize GIF.
 **/
const createGif = async (tokens: {
    [key: string]: TokenData;
}): Promise<Buffer> => {
    let i = 0;
    const gif = GIFEncoder();

    for (const tokenId in tokens) {
        const token = tokens[tokenId];
        const sharpImage = await parseImage(token.image);
        const addedTokenIdBuffer = await addTokenIdToImage(sharpImage, tokenId);

        await writeSingleGifFrame({
            gif: gif,
            imageBuffer: addedTokenIdBuffer
        });

        if (++i >= API_CALL_LIMIT) {
            const textBuffer = await createTextImage('And more ...');

            await writeSingleGifFrame({
                gif: gif,
                imageBuffer: textBuffer
            });
            break;
        }
    }

    const gifImage = await gifToBuffer(gif);

    return gifImage;
};

/**
 *
 * Writes a single frame to an animated GIF.
 *
 * @async
 * @function
 * @param {GifConfig} cfg - The configuration object that contains the image buffer and instance of GifEncoder
 * @param {pkg.Encoder} cfg.gif - Instance of GifEncoder.
 * @param {Buffer | Uint8Array} cfg.imageBuffer - The image buffer to be written to the GIF.
 **/
const writeSingleGifFrame = async (cfg: GifConfig): Promise<void> => {
    const { width, height } = await sharp(cfg.imageBuffer).metadata();

    if (!width || !height) {
        throw log.throwError(
            'Image width or height is not defined',
            Logger.code.IMAGE_ERROR,
            {
                location: Logger.location.IMAGE_PREPARE_GIF_ENCODING_DATA
            }
        );
    }

    const { buffer } = await sharp(cfg.imageBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer();
    const data = new Uint8ClampedArray(buffer);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);

    cfg.gif.writeFrame(index, width, height, {
        palette: palette
    });
};

/**
 *
 * Converts a GIFEncoder instance to a Buffer object.
 *
 * @async
 * @function
 * @param {pkg.Encoder} gif - Instance of GIFEncoder.
 * @param {number} [duration=1500] - An optional param duration between frames in milliseconds, defaults to 1500.
 * @returns {Promise<Buffer>} A buffer object that representing the GIF.
 **/
const gifToBuffer = async (
    gif: pkg.Encoder,
    duration = 1500
): Promise<Buffer> => {
    gif.finish();

    const bytes = gif.bytes();
    const gifImage = await sharp(bytes, { animated: true })
        .gif({ delay: duration })
        .toBuffer();

    return gifImage;
};

/**
 *
 * Creates a GIF image with required information of swap objects.
 *
 * @async
 * @function
 * @param {Swap} swap An object which contains the swap details.
 * @param {Config} config A configuration object with authentication info.
 * @returns {Promise<Buffer>} Buffer object that contains the finalized GIF.
 **/
const createSwapGif = async (swap: Swap, config: Config): Promise<Buffer> => {
    const gif = GIFEncoder();
    const arrayBuffer = await getArrayBuffer(
        'https://i.postimg.cc/qB8cqcM8/nft-trader-logo-black.png'
    );

    await writeSingleGifFrame({
        gif: gif,
        imageBuffer: arrayBuffer
    });

    let participant: keyof typeof swap;

    for (participant in swap) {
        const textImage = await createTextImage(
            `${swap[participant].name}\rOffer:`
        );

        await writeSingleGifFrame({ gif: gif, imageBuffer: textImage });

        for (const asset of swap[participant].spentAssets) {
            let imageBuffer;
            const tokenData = await getNftMetadata(
                asset.contractAddress,
                asset.tokenId,
                config.apiAuth
            );
            const sharpImage = await parseImage(tokenData.image);
            const quantityText = asset.amount ?? 0 > 1 ? `${asset.amount}` : '';

            asset.image = tokenData.image;

            if (tokenData.name) {
                asset.name = tokenData.name;
            } else {
                const symbol = await getSymbolName(
                    asset.contractAddress,
                    config.provider
                );
                asset.name = `${symbol} #${String(asset.tokenId).padStart(
                    4,
                    '0'
                )}`;
            }
            if (quantityText) {
                imageBuffer = await addQuantityToImage(
                    sharpImage,
                    quantityText
                );
            } else {
                imageBuffer = await sharpImage.png().resize(512).toBuffer();
            }
            await writeSingleGifFrame({ gif: gif, imageBuffer: imageBuffer });
        }
        if (swap[participant].spentAmount !== '0') {
            const imageBuffer = await createTextImage(
                `${swap[participant].spentAmount} ETH`
            );

            await writeSingleGifFrame({ gif: gif, imageBuffer: imageBuffer });
        }
    }

    const gifImage = await gifToBuffer(gif);

    return gifImage;
};

/**
 *
 * Adds a given token ID to an image.
 *
 * @async
 * @function
 * @param {sharp.Sharp} image The image to add the given token ID to.
 * @param {string} tokenId The token ID that should be added to the given image.
 * @returns {Promise<Buffer>} Buffer object that representing the image with the token ID added.
 **/
const addTokenIdToImage = async (
    image: sharp.Sharp,
    tokenId: string
): Promise<Buffer> => {
    const tokenIdPadding = tokenId.padStart(4, '0');
    const padding = (tokenIdPadding.length - 4) * 20 + 125;
    const tokenIdImage = await sharp({
        text: {
            text: `<span foreground="#B0C4DE" size="large"><b># ${tokenIdPadding}</b></span>`,
            rgba: true,
            dpi: 150
        }
    })
        .png()
        .toBuffer();

    return image
        .composite([
            { input: tokenIdImage, top: 20, left: IMAGE_WIDTH - padding }
        ])
        .resize(IMAGE_WIDTH)
        .png()
        .toBuffer();
};

/**
 *
 * Adds a given quantity to an image.
 *
 * @async
 * @function
 * @param {sharp.Sharp} image The image to add the given quantity to.
 * @param {string} quantity The quantity that should be added to the given image.
 * @returns {Promise<Buffer>} A Promise resolving buffer object that representing the image with the quantity added.
 **/
const addQuantityToImage = async (
    image: sharp.Sharp,
    quantity: string
): Promise<Buffer> => {
    const metadata = await image.metadata();

    if (!metadata.width) {
        throw log.throwMissingArgumentError('image.metadata.width', {
            location: Logger.location.IMAGE_ADD_QUANTITY_TO_IMAGE
        });
    }

    const tokenIdImage = await sharp({
        text: {
            text: `<span foreground="#B0C4DE" size="medium"><b>Amount: ${quantity}</b></span>`,
            font: 'Roboto',
            rgba: true,
            dpi: 150
        }
    })
        .png()
        .toBuffer();
    const padding = quantity.toString().length * 20 + 195;

    return image
        .composite([
            { input: tokenIdImage, top: 20, left: metadata.width - padding }
        ])
        .resize(IMAGE_WIDTH)
        .png()
        .toBuffer();
};

/**
 *
 * Creates an image with a text string centered.
 *
 * @async
 * @function
 * @param {string} text - The text string to be displayed
 * @returns {Promise<Buffer>} Promise resolving to a buffer of the generated image
 **/
const createTextImage = async (text: string) => {
    const blankImage = sharp({
        create: {
            width: IMAGE_WIDTH,
            height: IMAGE_WIDTH,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
    });
    const textImage = await sharp({
        text: {
            text: `<span foreground="black" size="x-large"><b>${text}</b></span>`,
            font: 'Roboto',
            align: 'center',
            rgba: true,
            dpi: 150
        }
    })
        .png()
        .toBuffer();

    return blankImage
        .composite([{ input: textImage, gravity: 'center' }])
        .png()
        .toBuffer();
};

/**
 *
 * Get an array buffer of the specified image URL.
 *
 * @async
 * @function
 * @param {string} url - The URL from which to fetch the array buffer.
 * @returns {Promise<Uint8Array>} - An array buffer object of the specified image URL.
 */
const getArrayBuffer = async (url: string): Promise<Uint8Array> => {
    const result = await retry(async () => {
        const response = await axios.get(url, {
            responseType: 'arraybuffer'
        });

        return response.data;
    });

    return result;
};

export {
    parseImage,
    createGif,
    createSwapGif,
    getArrayBuffer,
    createTextImage
};
