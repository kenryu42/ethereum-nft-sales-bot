import Joi from 'joi';

export default Joi.object({
    alchemy: Joi.object({
        apiKey: Joi.string().required()
    }).optional(),
    infura: Joi.object({
        apiKey: Joi.string().required(),
        apiKeySecret: Joi.string().required()
    }).optional()
}).or('alchemy', 'infura');
