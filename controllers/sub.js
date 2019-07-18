const express = require('express')
const joi = require('@hapi/joi')
const fs = require('fs')

const Sub = require('../models/sub')
const Img = require('../models/img')
const Type = require('../models/type')
const Work = require('../models/work')

const util = require('../lib/util')
const schema = require('../lib/schema')
const config = require('../config/config')

/**
 * 添加 sub
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const add = async (req, res, next) => {
    try {
        // 检查上传数据
        const value = await joi.validate(req.body, schema.sub.add)
            .catch(err => {
                err.msg = 'work数据错误'
                err.code = '406'
                throw err
            })
        // 检查 work 是否存在
        let work = await Work.findById(value.work)
            .catch(err => Promise.reject(err))
        if (!work) {
            const err = new Error()
            err.msg = '没有找到work'
            err.code = '406'
            throw err
        }
        let conditions = {
            work: work._id,
            is_deleted: false
        }
        let subCount = await Sub.count(conditions)
            .catch((err) => {throw err})

        // 保存 sub
        let data = {
            name: value.name,
            secret: value.secret,
            subType: work.subType,
            work: value.work,
            sort: subCount
        }
        value.originName && (data.originName = value.originName)
        const sub = await Sub.create(data)
            .catch(err => Promise.reject(err))

        // 更新 work
        conditions = {
            update_at: Date.now(),
            secret: false
        }
        work = await Work.findByIdAndUpdate(value.work, conditions)
            .catch((err) => {throw err})

        res.send(sub._id)
    } catch (e) {
        next(e)
    }
}

/**
 * 删除 sub
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const del = async (req, res, next) => {
    try {
        const value = await joi.validate(req.body, schema.sub.del)
            .catch(err => {
                err.msg = '请求数据错误'
                err.code = '406'
                throw err
            })

        const delSubs = value.ids.map(async (sub) => {
            const option = {
                is_deleted: true,
                update_at: Date.now(),
                deleted_at: Date.now()
            }
            const result = await Sub.findByIdAndUpdate(sub._id, option)
                .catch((err) => {throw err})
            // 删除 img
            if (sub.img) {
                const option = {
                    is_deleted: true,
                    update_at: Date.now(),
                    deleted_at: Date.now()
                }
                const result = await Img.findByIdAndUpdate(sub.img, option)
                    .catch((err) => {throw err})
            }
            return sub.work
        })

        const result = await Promise.all(delSubs)
        let subs = await Sub.find({work: result[0]}, null, {is_deleted: false})
            .catch((err) => {throw err})
        let work = await Work.findById(result[0])
            .catch((err) => {throw err})
        if (subs.length === 0) {
            const option = {
                is_deleted: true,
                update_at: Date.now(),
                deleted_at: Date.now()
            }
            const result = await Work.findByIdAndUpdate(result[0], option)
                .catch((err) => {throw err})
            res.send(result._id)
        }
        let secret = subs.every(item => item.secret === true)
        if (secret !== work.secret) {
            const option = {
                secret: secret,
                update_at: Date.now()
            }
            const result = await Work.findByIdAndUpdate(result[0], option)
                .catch((err) => {throw err})
            res.send(result._id)
        }
        res.send(result[0])
    } catch (e) {
        next(e)
    }

}

/**
 * 获取 sub 列表
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const index = async (req, res, next) => {
    try {
        // 检查上传数据
        const value = await joi.validate(req.query, schema.sub.add)
            .catch(err => {
                err.msg = 'work数据错误'
                err.code = '406'
                throw err
            })

        let type = await Type.findById(value.subType)
            .catch(err => Promise.reject(err))

        let reg = `/${value.query}/`
        let conditions = {
            $or: [
                { name: {$regex: reg} },
                { originName: {$regex: reg}},
                { info: {
                    $elemMatch: {
                        name: {$regex: reg}
                    }
                }}
            ],
            is_deleted: false
        }
        let options = {
            sort: {
                update_at: -1
            }
        }
        let subs = await Sub.find(conditions, null, options)
            .catch((err) => {throw err})

        let subsPromise = subs.map(async(sub, index) => {
            let item = {
                name: sub.name,
            }
            sub.originName && (item.originName = sub.originName)
            sub.info && sub.info.length && (item.info = sub.info)
            sub.tag && sub.tag.length && (item.tag = sub.tag)
            if (sub.img) {
                let image = await Image.findById(sub.img)
                    .catch((err) => {throw err})
                item.img = `${config.url.img}/${image.path}`
            }
            return item
        })
        let result = await Promise.all(subsPromise)
        res.send(subs)
    } catch(e) {
        next(e)
    }
}


const test = async (req, res, next) => {
    util.log(req.body.img)
    util.send(res, 'success')
}


module.exports = {
    add,
    del,
    index
}

