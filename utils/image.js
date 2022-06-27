import { Gif } from 'make-a-gif';
import Jimp from 'jimp-compact';
import { IMAGE_SIZE } from '../config/setup.js';
import { getTokenData } from './api.js';

const { width, height } = IMAGE_SIZE;

const resizeImage = async (image) => {
	const resizedImage = await Jimp.read(image);
	resizedImage.resize(width, height);
	const buffer = await resizedImage.getBufferAsync(Jimp.MIME_PNG);

	return buffer;
};

const createGif = async (tokens) => {
	console.log('Creating GIF...');
	const frames = [];

	for (const token of tokens) {
		const tokenData = await getTokenData(token);
		const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
		const image = !tokenData.image
			? await createNaImage()
			: await Jimp.read(tokenData.image);
		const tokenIdText = {
			text: `# ${String(token).padStart(4, '0')}`,
			alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
			alignmentY: Jimp.VERTICAL_ALIGN_TOP
		};
		image.print(font, -20, 20, tokenIdText, width, height);
		const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
		frames.push({ src: buffer });
	}

	const myGif = new Gif(width, height, 100);
	await myGif.setFrames(frames);

	const gifImage = await myGif.encode();
	console.log('GIF created.');

	return gifImage;
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

export { createGif, createNaImage, resizeImage };
