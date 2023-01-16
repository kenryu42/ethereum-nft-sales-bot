import { utils } from 'ethers';

export const getTagFromDomain = (domain: string) => {
    return utils.keccak256(utils.toUtf8Bytes(domain)).slice(2, 10);
};
