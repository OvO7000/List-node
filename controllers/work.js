const express = require('express')
const joi = require('@hapi/joi')
const fs = require('fs')

const Sub = require('../models/sub')
const Img = require('../models/img')
const Type = require('../models/type')
const Work = require('../models/work')
const util = require('../lib/util')
const schema = require('../lib/schema')

const add = async (req, res) =>  {
    try {
        // 检查上传数据
        const value = await joi.validate(req.body, schema.work)
            .catch(err => Promise.reject( 'work数据错误'))
        // 检查 subType 是否存在
        const subType = await Type.findOne({ 'subType.name_en': value.subType })
            .catch(err => Promise.reject(err))
        if (!subType) {
          throw new Error('没有找到subType')
        }
        // 检查 work 是否已存在
        let option = {
            'name': value.name,
            'subType': subType._id
        }
        const works = await Work.find(option)
            .catch(err => Promise.reject(err))
        if (works.length > 0) {
            throw new Error('work已存在')
        }
        // 保存 work
        let data = {
            name: value.name,
            rank: value.rank,
            subType: subType._id,
        }
        const secret = value.sub.every(item => item.secret === true)
        data.secret = secret
        const work = await Work.create(data)
            .catch(err => Promise.reject(err))

        // 保存sub
        value.sub.forEach(async item =>{
            if (item.img) {
            }

            let option = item
            option.work = work._id

            await Sub.create(option)
                .catch(err => Promise.reject(err))
        })

        util.send(res, work._id)
    } catch (e) {
        util.log(e)
        util.errSend(res, e)
    }
}

module.exports = {
    add
}

