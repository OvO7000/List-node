const express = require('express')
const joi = require('@hapi/joi')
const fs = require('fs')

const Sub = require('../models/sub')
const Img = require('../models/img')
const Type = require('../models/type')
const Work = require('../models/work')
const Figure = require('../models/figure')

const util = require('../lib/util')
const schema = require('../lib/schema')
const config = require('../config/config')

const add = async (req, res, next) => {
    try {
        // 检查上传数据
        const value = await joi.validate(req.body, schema.figure.add)
            .catch(err => {
                err.msg = 'figure数据错误'
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
        // 检查 work
        let workResults
        if (value.work && value.work.length > 0) {
            let workPromises = value.work.filter(async(workID, index) => {
                let work = Sub.findById(workID)
                    .catch(err => Promise.reject(err))
                if (work) {
                    return true
                }
            })
            workResults = await Promise.all(workPromises)
                .catch(err => Promise.reject(err))
        }
        // 保存 figure
        let data = {
            name: value.name,
            originName: value.originName,
            subType: subType._id,
            secret: value.secret,
            link: value.link
        }
        workResults && workResults.length && (data.work = workResults)

        const figure = await Figure.create(data)
            .catch(err => Promise.reject(err))

        res.send(figure._id)
    } catch (e) {
        next(e)
    }
}

const index = async (req, res, next) => {
    try {
        const value = await joi.validate(req.query, schema.figure.index)
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
        let results = []
        // 统计 work
        let conditions = {
            subType: value.subType,
            is_deleted: false
        }
        const count = await Figure.count(conditions)
            .catch(err => Promise.reject(err))
        // figure 数量为 0, 返回空数组
        if (count === 0 || value.count >= count) {
            res.send(results)
            return next()
        }
        // figure 数量不为 0
        // 查找 figure
        let options = {
            skip: value.count,
            sort: {
                update_at: -1
            },
            limit: config.pagination
        }
        const figures = await Figure.find(conditions, null, options)
            .catch(err => Promise.reject(err))
        if (!figures) {
            res.send(results)
            return next()
        }
        // 整理返回数据
        let getResults = figures.map(async(figure, index) => {
            console.log(figure)
            let result = {
                id: figure._id,
                name: figure.name
            }
            figure.originName && (result.originName = figure.originName)
            figure.link && figure.link.length && (result.link = figure.link)
            // 查找 sub
            if (figure.work && figure.work.length > 0) {
                let imgs = []
                let subs = []
                let getSubs = figure.work.map(async(subID, index) => {
                    let sub = await Sub.findById(subID)
                        .catch(err => Promise.reject(err))
                    if (sub && sub.is_deleted === false) {
                        // 查找图片
                        if (sub.img) {
                            let img = await Img.findById(sub.img)
                                .catch(err => Promise.reject(err))
                            if (img && img.is_deleted === false) {
                                imgs.push({
                                    compressed: `${config.url.img}/${img.path}`,
                                    id: img._id,
                                    sub: sub._id
                                })
                            }
                        }
                        let subType
                        if (sub.subType) {
                            subType = await Type.findById(sub.subType)
                                .catch(err => Promise.reject(err))
                        }
                        console.log(subType)
                        return {
                            id: sub._id,
                            name: sub.name,
                            title: subType.subType.name
                        }
                    }
                })
                subs = await Promise.all(getSubs)
                    .catch(err => Promise.reject(err))

                subs && subs.length && (result.work = subs)
                imgs && imgs.length && (result.imgs = imgs)
            }

            return result
        })
        results = await Promise.all(getResults)
            .catch(err => Promise.reject(err))

        res.send(results)
    } catch(e) {
        next(e)
    }
}

const del = async (req, res, next) => {
    try {
        const value = await joi.validate(req.params, schema.figure.del)
            .catch(err => {
                err.msg = '请求数据错误'
                err.code = '406'
                throw err
            })

        const figure = await Figure.findById(value.id)
            .catch(err => Promise.reject(err))

        if (!figure || figure.is_deleted) {
            const err = new Error()
            err.msg = '没有找到figure'
            err.code = '406'
            throw err
        }
        // 删除 work
        const option = {
            is_deleted: true,
            update_at: Date.now(),
            deleted_at: Date.now()
        }
        figure.save(option).catch((err) => {throw err})
        res.send(figure._id)
    } catch(e) {
        next(e)
    }
}

module.exports = {
    add,
    del,
    index
}

