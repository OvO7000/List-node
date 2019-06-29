const express = require('express')
const joi = require('@hapi/joi')
const fs = require('fs')

const Sub = require('../models/sub')
const Img = require('../models/img')
const Type = require('../models/type')
const Work = require('../models/work')

const util = require('../lib/util')
const schema = require('../lib/schema')

const add = async (req, res, next) => {
    try {
        // 检查上传数据
        const value = await joi.validate(req.body, schema.work)
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
        let promises = value.sub.map(async item => {

            let option = item
            option.work = work._id

            let sub = await Sub.create(option)
                .catch(err => Promise.reject(err))
            // util.log(sub)
            return sub._id
        })
        // util.log(result)
        const result = await Promise.all(promises)

        res.send(result)
    } catch (e) {
        // util.errSend(res, e)
        next(e)
    }
}

const test = async (req, res, next) => {
    util.log(req.body.img)
    util.send(res, 'success')
}


module.exports = {
    add
}

