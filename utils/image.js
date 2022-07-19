import Jimp from 'jimp-compact';
import { Gif } from 'make-a-gif';
import { getTokenData } from './api.js';
import { IMAGE_SIZE } from '../config/setup.js';

const GIF_DURATION = 1500;
const { width, height } = IMAGE_SIZE;

const resizeImage = async (image) => {
    const resizedImage = await Jimp.read(image);
    resizeImage.resize(width, Jimp.AUTO);
    const buffer = await resizedImage.getBufferAsync(Jimp.MIME_PNG);

    return buffer;
};

const createGif = async (tokens) => {
    console.log('Creating GIF...');
    const frames = [];

    for (const token of tokens) {
        const tokenData = await getTokenData(token);
        const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        const image = !tokenData.image ? await createNaImage() : await Jimp.read(tokenData.image);
        image.resize(width, Jimp.AUTO);
        const tokenIdText = {
            text: `# ${String(token).padStart(4, '0')}`,
            alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
            alignmentY: Jimp.VERTICAL_ALIGN_TOP
        };
        image.print(font, -20, 20, tokenIdText, width, height);
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
        frames.push({ src: buffer, duration: GIF_DURATION });
    }

    const myGif = new Gif(width, height, 100);
    await myGif.setFrames(frames);

    const gifImage = await myGif.encode();
    console.log('GIF created.');

    return gifImage;
};

const createSwapGif = async (swap, addressMaker, addressTaker) => {
    console.log('Creating Swap GIF...');
    const frames = [];
    const image = await Jimp.read('https://i.postimg.cc/qB8cqcM8/nft-trader-logo-black.png');
    const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

    frames.push({ src: buffer, duration: GIF_DURATION });

    for (const address of [addressMaker, addressTaker]) {
        let image = new Jimp(width, height, 'white');
        image = await addTextToImage(image, swap[address].name, 0, -25, true);
        const buffer = await addTextToImage(image, 'Received:', 0, 25);

        frames.push({ src: buffer, duration: GIF_DURATION });

        for (const asset of swap[address].receivedAssets) {
            const tokenData = await getTokenData(asset.tokenId, asset.contractAddress);
            const image = !tokenData.image
                ? await createNaImage()
                : await Jimp.read(tokenData.image);
            image.resize(width, Jimp.AUTO);
            const quantity = asset.quantity > 1 ? ` Quantity: ${asset.quantity}` : '';
            const text = `${tokenData.symbol} #${String(asset.tokenId).padStart(
                4,
                '0'
            )}${quantity}`;
            const buffer = await addTextToImage(image, text, -20, 20, false, true);

            frames.push({ src: buffer, duration: GIF_DURATION });
        }
        if (parseFloat(swap[address].receivedValue) > 0) {
            const image = new Jimp(width, height, 'white');
            const buffer = await addTextToImage(image, `${swap[address].receivedValue} ETH`, 0, 0);

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

const addTextToImage = async (image, text, x, y, jimp = false, idText = false) => {
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

const createNaImage = async (getBuffer = false) => {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
    const image = new Jimp(width, height, 'white');
    const naText = {
        text: 'Content not available yet',
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

export { createGif, createSwapGif, createNaImage, resizeImage };
