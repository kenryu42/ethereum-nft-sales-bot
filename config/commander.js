import { Command } from 'commander';

const program = new Command();

program.name('app.js').description('CLI to NFT sales bot').version('0.1.0');

program.option(
	'-t, --test <tx>',
	'test by running the app for the given transaction hash'
);

program.parse();

export const options = program.opts();
