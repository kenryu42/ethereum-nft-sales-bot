import Joi from 'joi';
import { ethers } from 'ethers';

export default Joi.object({
    contractAddress: Joi.string()
        .custom((value, helper) => {
            if (!ethers.isAddress(value)) {
                return helper.message({ custom: 'Invalid contract address.' });
            } else {
                return true;
            }
        })
        .required(),
    transactionHash: Joi.string().optional(),
    etherscanApiKey: Joi.string().optional(),
    test: Joi.boolean().optional(),
    tokenType: Joi.string().allow('ERC721', 'ERC1155').optional(),
    discordWebhook: Joi.string()
        .regex(/^https:\/\/discord\.com\/api\/webhooks\/.*/)
        .optional(),
    twitterConfig: Joi.object({
        appKey: Joi.string().required(),
        appSecret: Joi.string().required(),
        accessToken: Joi.string().required(),
        accessSecret: Joi.string().required()
    }).optional()
});
