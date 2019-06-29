const joi = require('@hapi/joi')
const config = require('../config/config')

const work = joi.object().keys({
    // name: joi.string().min(0).max(30).required(),
    rank: joi.boolean().default(false),
    subType: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
    type: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
    sub: joi.array().items(joi.object().keys({
        name: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
        originName: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/),
        info: joi.array().items( joi.object().keys({
            name: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
            title: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
            href: joi.string().regex(/^[a-z0-9]{24}$/)
        })),
        tag: joi.array().items( joi.number().valid(0, 1, 2, 3)),
        secret: joi.boolean().default(false)
    })).required()
})

const img = joi.object().keys({
    ids: joi.array().items(joi.string().regex(/^[a-z0-9]{24}$/)),
    idsWithImg: joi.array().items(joi.string().regex(/^[a-z0-9]{24}$/))
})

module.exports = {
    work,
    img
}