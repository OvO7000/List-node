const joi = require('@hapi/joi')
const config = require('../config/config')

const work = {
    add: joi.object().keys({
        // name: joi.string().min(0).max(30).required(),
        rank: joi.boolean().default(false),
        subType: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
        type: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
        sub: joi.array().items(joi.object().keys({
            name: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
            originName: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/),
            info: joi.array().items(joi.object().keys({
                name: joi.string().regex(/^[\u4E00-\u9FA5\w ]{1,20}$/).required(),
                title: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
                href: joi.string().regex(/^[a-z0-9]{24}$/)
            })),
            tag: joi.array().items(joi.number().valid(0, 1, 2, 3)),
            secret: joi.boolean().default(false)
        })).required()
    }),
    edit: joi.object().keys({
        id: joi.string().regex(/^[a-z0-9]{24}$/).required(),
        rank: joi.boolean().default(false),
        sub: joi.array().items(joi.object().keys({
            id: joi.string().regex(/^[a-z0-9]{24}$/).required(),
            name: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
            originName: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/),
            info: joi.array().items(joi.object().keys({
                name: joi.string().regex(/^[\u4E00-\u9FA5\w ]{1,20}$/).required(),
                title: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
                href: joi.string().regex(/^[a-z0-9]{24}$/)
            })),
            tag: joi.array().items(joi.number().valid(0, 1, 2, 3)),
            secret: joi.boolean()
        })).required()
    }),
    index: joi.object().keys({
        subType: joi.string().regex(/^[a-z0-9]{24}$/).required(),
        count: joi.number().integer().min(0).required()
    }),
    del: joi.object().keys({
        id: joi.string().regex(/^[a-z0-9]{24}$/).required(),
    })
}
const img = {
    adds: joi.object().keys({
        ids: joi.array().items(joi.string().regex(/^[a-z0-9]{24}$/)).required()
    }),
    del: joi.object().keys({
        id: joi.string().regex(/^[a-z0-9]{24}$/).required()
    }),
    edit: joi.object().keys({
        id: joi.string().regex(/^[a-z0-9]{24}$/).required(),
        sub: joi.string().regex(/^[a-z0-9]{24}$/).required()
    }),
    add: joi.object().keys({
        sub: joi.string().regex(/^[a-z0-9]{24}$/).required()
    })
}
const sub = {
    add: joi.object().keys({
        work: joi.string().regex(/^[a-z0-9]{24}$/).required(),
        name: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
        originName: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/),
        info: joi.array().items(joi.object().keys({
            name: joi.string().regex(/^[\u4E00-\u9FA5\w ]{1,20}$/).required(),
            title: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
            href: joi.string().regex(/^[a-z0-9]{24}$/)
        })),
        tag: joi.array().items(joi.number().valid(0, 1, 2, 3)),
        secret: joi.boolean().default(false)
    }),
    del: joi.object().keys({
        ids: joi.array().items(joi.string().regex(/^[a-z0-9]{24}$/).required())
    }),
    index: joi.object().keys({
        query: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
        subType: joi.string().regex(/^[a-z0-9]{24}$/).required()
    })
}
const figure = {
    add: joi.object().keys({
        name: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
        originName: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/),
        subType: joi.string().regex(/^[\u4E00-\u9FA5\w]{1,20}$/).required(),
        link: joi.array().items(joi.object().keys({
            name: joi.string().regex(/^[\u4E00-\u9FA5\w ]{1,20}$/).required(),
            href: joi.string().required(),
        })),
        secret: joi.boolean().default(false)
    }),
    del: joi.object().keys({
        ids: joi.array().items(joi.string().regex(/^[a-z0-9]{24}$/).required()),
    }),
    index: joi.object().keys({
        subType: joi.string().regex(/^[a-z0-9]{24}$/).required(),
        count: joi.number().integer().min(0).required()
    })
}


module.exports = {
    work,
    img,
    sub,
    figure
}