import { ethers } from 'ethers';
import { createRequire } from 'module';
import { currencies } from '../config/markets.js';

import type { Provider } from 'ethers';
import type { TokenData } from '../types/contracts/token.contract.js';
import type { Market, CurrencyAddress } from '../types/models/market.model.js';

const require = createRequire(import.meta.url);
const ABI = require('../abi/ABI.json');

interface SetTokenDataOpts {
    tokens: { [key: string]: TokenData };
    tokenId: string;
    price?: number;
    amount?: number;
    market: Market;
    currencyAddr?: CurrencyAddress;
}
/**
 *
 * Gets the symbol name for a given contract address.
 *
 * @async
 * @function
 * @param {string} contractAddress - The contract address to lookup.
 * @param {Provider} provider - An instance of Provider.
 * @returns {Promise<string>} The symbol name of the contract or empty string if not found.
 **/
const getSymbolName = async (
    contractAddress: string,
    provider: Provider
): Promise<string> => {
    const contract = new ethers.Contract(contractAddress, ABI, provider);

    try {
        return await contract.symbol();
    } catch {
        return '';
    }
};

/**
 *
 * Format the price to four decimal places, or less if all trailing decimals are zeros.
 *
 * @function
 * @param {number} price - Price to format.
 * @returns {string} Price with up to four decimal places.
 **/
const formatPrice = (price: number): string => {
    let i = 0;
    let formatedPrice = price.toLocaleString('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4
    });
    let lastIdx = formatedPrice.length - 1;

    while (formatedPrice[lastIdx] === '0' || formatedPrice[lastIdx] === '.') {
        i++;
        if (formatedPrice[lastIdx--] === '.') {
            break;
        }
    }

    if (i > 0) {
        formatedPrice = formatedPrice.slice(0, -i);
    }

    return formatedPrice === '' ? '0' : formatedPrice;
};

/**
 *
 * Sets the token data of a given token details.
 *
 * @function
 * @param {SetTokenDataOpts} opts - SetTokenDataOpts object.
 * @param {{[key: string]: TokenData}} opts.tokens - The token data object with token id as key.
 * @param {string} opts.tokenId - The token id.
 * @param {number} [opts.price=] - An optional nft sale price.
 * @param {number} [opts.amount=] - An optional token amount.
 * @param {Market} opts.market - The market object.
 * @param {CurrencyAddress} [opts.currencyAddr=] - An optional currency address.
 */
const setTokenData = (opts: SetTokenDataOpts): void => {
    const token = opts.tokens[opts.tokenId];
    const currency = opts.currencyAddr
        ? currencies[opts.currencyAddr]
        : undefined;

    if (token && token.markets) {
        const currentMarket = token.markets[opts.market.name];

        currentMarket.amount = opts.amount
            ? currentMarket.amount + opts.amount
            : currentMarket.amount;
        currentMarket.price.value = opts.price
            ? formatPrice(Number(currentMarket.price.value) + opts.price)
            : currentMarket.price.value;
    } else {
        opts.tokens[opts.tokenId] = {
            name: '',
            image: '',
            tokenId: opts.tokenId,
            markets: {
                [opts.market.name]: {
                    market: opts.market,
                    amount: opts.amount ? opts.amount : 0,
                    price: {
                        value: opts.price ? formatPrice(opts.price) : '~',
                        currency: {
                            name: currency ? currency.name : '',
                            decimals: currency ? currency.decimals : 0
                        }
                    }
                }
            }
        };
    }
};

export { formatPrice, setTokenData, getSymbolName };
