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

const add = async (req, res, next) => {
    try {
        // 检查上传数据
        const value = await joi.validate(req.body, schema.work.add)
            .catch(err => {
                err.msg = 'work数据错误'
                err.code = '406'
                throw err
            })
        // 检查 subType 是否存在
        const subType = await Type.findOne({'subType.name_en': value.subType})
            .catch(err => Promise.reject(err))
        if (!subType) {
            const err = new Error()
            err.msg = '没有找到subType'
            err.code = '406'
            throw err
        }
        // 保存 work
        let data = {
            rank: value.rank,
            subType: subType._id,
        }
        data.secret = value.sub.every(item => item.secret === true)
        const work = await Work.create(data)
            .catch(err => Promise.reject(err))

        // 保存sub
        let promises = value.sub.map(async (item, index) => {

            item.work = work._id
            item.sort = index
            item.subType = subType._id
            let sub = await Sub.create(item)
                .catch(err => Promise.reject(err))
            return sub._id
        })
        const result = await Promise.all(promises)

        res.send(result)
    } catch (e) {
        next(e)
    }
}

const edit = async (req, res, next) => {
    try {
        // 检查上传数据
        req.body.id = req.params.id
        const value = await joi.validate(req.body, schema.work.edit)
            .catch(err => {
                err.msg = 'work数据错误'
                err.code = '406'
                throw err
            })
        // 检查 work 是否存在
        let work = await Work.findById(value.id)
            .catch(err => Promise.reject(err))
        if (!work) {
            const err = new Error()
            err.msg = '没有找到work'
            err.code = '406'
            throw err
        }
        // 保存sub
        let editSub = value.sub.map(async item => {

            let sub = await Sub.findById(item.id)
                .catch(err => Promise.reject(err))
            if (!sub) {
                const err = new Error()
                err.msg = '没有找到sub'
                err.code = '406'
                throw err
            }

            if (hasChange(sub, item)) {
                let conditions = {
                    name: item.name,
                    secret: item.secret,
                    info: item.info ? item.info : [],
                    tag: item.tag ? item.tag : [],
                    update_at: Date.now()
                }
                let sub = await Sub.findByIdAndUpdate(item.id, conditions)
                    .catch(err => Promise.reject(err))

                return sub
            }
        })
        let editSubResult = await Promise.all(editSub)

        let secret = value.sub.every(item => item.secret === true)

        if (secret !== work.secret || value.rank !== work.rank) {
            const conditions = {
                secret: secret,
                rank: value.rank,
                update_at: Date.now()
            }
            let result = await Work.findByIdAndUpdate(work.id, conditions)
                .catch((err) => {throw err})
            res.send(result._id)
        }

        res.send(work._id)
    } catch (e) {
        next(e)
    }
}

const index = async (req, res, next) => {
    try {
        const value = await joi.validate(req.query, schema.work.index)
            .catch(err => {
                err.msg = '请求数据错误'
                err.code = '406'
                throw err
            })
        // 查找 subType
        const subType = await Type.findById(value.subType)
            .catch(err => Promise.reject(err))
        if (!subType || subType.is_deleted) {
            const err = new Error()
            err.msg = '没有找到subType'
            err.code = '406'
            throw err
        }
        let result = []
        // 统计 work
        let conditions = {
            subType: value.subType,
            is_deleted: false
        }
        const count = await Work.count(conditions)
            .catch(err => Promise.reject(err))
        // work 数量为 0, 返回空数组
        if (count === 0 || value.count >= count) {
            res.send(result)
            return next()
        }
        // work 数量不为 0
        // 查找 works
        let options = {
            skip: value.count,
            sort: {
                rank: -1,
                update_at: -1
            },
            limit: config.pagination
        }
        const works = await Work.find(conditions, null, options)
            .catch(err => Promise.reject(err))
        if (!works) {
            res.send(result)
            return next()
        }
        // 查找 sub
        let promises = works.map(async (work, index) => {
            let conditions = {
                work: work._id,
                is_deleted: false
            }
            let options = {
                sort: {
                    sort: 1
                }
            }
            const subs = await Sub.find(conditions, null, options)
                .catch(err => Promise.reject(err))
            if (!subs) return
            const result = {
                id: work._id,
                rank: work.rank,
                sub: [],
                imgs: []
            }
            subs.filter(item => item.is_deleted === false)
                .forEach((item, index) => {
                    const sub = {
                        id: item._id,
                        name: item.name,
                    }
                    item.originName && (sub.originName = item.originName)
                    item.info && item.info.length && (sub.info = item.info)
                    item.tag && item.tag.length && (sub.tag = item.tag)
                    result.sub.push(sub)
                })
            // 查找图片
            const promises = subs.filter(item => !!item.img).map(async (item, index) => {
                const img = await Img.findById(item.img)
                    .catch(err => Promise.reject(err))
                if (img) {
                    return {
                        id: img._id,
                        sub: item._id,
                        compressed: config.url.img + '/' + img.path
                    }
                }
            })
            const imgs = await Promise.all(promises)
            result.imgs = imgs
            return result
        })
        result = await Promise.all(promises)
        res.send(result)

    } catch (e) {
        next(e)
    }
}


const del = async (req, res, next) => {
    try {
        const value = await joi.validate(req.params, schema.work.del)
            .catch(err => {
                err.msg = '请求数据错误'
                err.code = '406'
                throw err
            })

        const work = await Work.findById(value.id)
            .catch(err => Promise.reject(err))

        if (!work || work.is_deleted) {
            const err = new Error()
            err.msg = '没有找到work'
            err.code = '406'
            throw err
        }
        // 删除 work
        const option = {
            is_deleted: true,
            update_at: Date.now(),
            deleted_at: Date.now()
        }
        const result = await Work.findByIdAndUpdate(work._id, option)
            .catch((err) => {
                throw err
            })
        let conditions = {
            work: work._id,
            is_deleted: false
        }
        const subs = await Sub.find(conditions)
            .catch(err => Promise.reject(err))
        // 删除 subs
        if (subs && subs.length) {
            const delSubs = subs.map(async (sub) => {
                const option = {
                    is_deleted: true,
                    update_at: Date.now(),
                    deleted_at: Date.now()
                }
                const result = await Sub.findByIdAndUpdate(sub._id, option)
                    .catch((err) => {
                        throw err
                    })
                // 删除 img
                if (sub.img) {
                    const option = {
                        is_deleted: true,
                        update_at: Date.now(),
                        deleted_at: Date.now()
                    }
                    const result = await Img.findByIdAndUpdate(sub.img, option)
                        .catch((err) => {
                            throw err
                        })
                }
                return sub._id
            })

            const result = await Promise.all(delSubs)
        }

        res.send(work._id)
    } catch (e) {
        next(e)
    }

}


const test = async (req, res, next) => {
    util.log(req.body.img)
    util.send(res, 'success')
}

function hasChange(sub, item) {
    if (item.name !== sub.name || item.originName !== sub.originName || item.secret !== sub.secret) {
        return true
    }
    // tag
    if (item.tag) {
        if (sub.tag.length !== item.tag.length) {
            return true
        } else {
            sub.tag.sort()
            item.tag.sort()
            sub.tag.forEach((tag, index) => {
                if (tag !== item.tag[index]) {
                    return true
                }
            })
        }
    }
    if (!item.tag && sub.tag.length !== 0) {
        return true
    }
    // info
    if (item.info) {
        if (sub.info.length !== item.info.length) {
            return true
        } else {
            sub.info.sort()
            item.info.sort()
            sub.info.forEach((info, index) => {
                if (info.name !== item.info[index].name || info.title !== item.info[index].title) {
                    return true
                }
            })
        }
    }
    if (!item.info && sub.info.length !== 0) {
        return true
    }

    return false
}

module.exports = {
    add,
    edit,
    index,
    del
}

