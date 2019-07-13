const express = require('express')
const fs = require('fs').promises
const joi = require('@hapi/joi')

const Img = require('../models/img')
const Work = require('../models/work')
const Type = require('../models/type')
const Sub = require('../models/sub')

const util = require('../lib/util')
const schema = require('../lib/schema')
const config = require('../config/config')


const adds = async (req, res, next) => {
    try {
        const value = await joi.validate(req.body, schema.img.adds)
            .catch((err) => {
                err.msg = 'img数据错误'
                err.code = '406'
                throw err
            })
        const saveImg = value.ids.map(async (id, index) => {
            // 查找 sub
            const sub = await Sub.findById(id)
                .catch((err) => {
                    throw err
                })
            if (!sub || !sub.work) {
                const err = new Error()
                err.msg = '没有找到Sub'
                err.code = 406
                throw err
            }
            // 查找 work
            const work = await Work.findById(sub.work)
                .catch((err) => {
                    throw err
                })
            if (!work || !work.subType) {
                const err = new Error()
                err.msg = '没有找到Work'
                err.code = 406
                throw err
            }
            // 查找 type
            const type = await Type.findById(work.subType)
                .catch((err) => {
                    throw err
                })
            if (!type) {
                const err = new Error()
                err.msg = '没有找到Type'
                err.code = 406
                throw err
            }
            // 移动新图片
            const file = req.files[index]
            // 'assets/imgs/work/comic/xxxx.jpg'
            // 'assets/imgs/work/comic'
            // 'work/comic/xxxx.jpg'
            const newFile = config.img.path.work + '/' + type.subType.name_en + '/' + file.filename
            const newPath = config.img.path.work + '/' + type.subType.name_en
            const savePath = 'work/' + type.subType.name_en + '/' + file.filename
            const exist = await fs.access(newPath)
                .catch(async (err) => {
                    if (err.code === 'ENOENT') {
                        const mkdir = await fs.mkdir(newPath, {recursive: true})
                            .catch((err) => {
                                throw err
                            })
                    }
                })

            const save = await fs.rename(file.path, newFile)
                .catch((err) => {
                    throw err
                })

            // 保存 img
            let option = {
                path: savePath
            }

            let img = await Img.create(option)
                .catch(err => {
                    throw err
                })
            // 更新 sub
            let subOption = {
                img: img._id,
                update_at: Date.now()
            }
            const result = Sub.findByIdAndUpdate(sub.id, subOption)
                .catch(err => {
                    throw err
                })
            // 返回
            return img._id
        })
        const result = await Promise.all(saveImg)

        const uploads = await fs.readdir(config.img.path.upload)
            .catch((err) => {
                throw err
            })
        // 删除 uploads 文件夹下图片
        const deleteUploads = uploads.map(item => {
            fs.unlink(item).catch((err) => {
                throw err
            })
        })
        await Promise.all(deleteUploads)
        res.send(result)

    } catch (e) {
        next(e)
    }

}

const del = async (req, res, next) => {
    const value = await joi.validate(req.params, schema.img.del)
        .catch((err) => {
            err.msg = 'img数据错误'
            err.code = '406'
            throw err
        })
    const conditions = {
        is_deleted: true,
        update_at: Date.now(),
        deleted_at: Date.now()
    }
    let img = await Img.findByIdAndUpdate(value.id, conditions)
        .catch((err) => {
            throw err
        })
    let sub = await Sub.findOneAndUpdate({img: value.id}, {$unset: {img: ''}})
        .catch((err) => {
            throw err
        })
    await fs.unlink(`${config.img.path.all}/${img.path}`)
        .catch((err) => {
            throw err
        })

    res.send(img._id)
}

const edit = async (req, res, next) => {
    try {
        req.body.id = req.params.id
        const value = await joi.validate(req.body, schema.img.edit)
            .catch((err) => {
                err.msg = 'img数据错误'
                err.code = '406'
                throw err
            })

        let img = await Img.findById(value.id)
            .catch((err) => {
                throw err
            })
        if (!img || img.is_deleted) {
            const err = new Error()
            err.msg = '没有找到Img'
            err.code = 406
            throw err
        }
        // 删除旧图片
        await fs.unlink(`${config.img.path.all}/${img.path}`)
            .catch((err) => {
                throw err
            })
        // 移动新图片
        const file = req.file
        // 'assets/imgs/work/comic/xxxx.jpg'
        // 'assets/imgs/work/comic'
        // 'work/comic/xxxx.jpg'
        let type = img.path.split('/')[0]
        let subType = img.path.split('/')[1]
        const newFile = `${config.img.path.all}/${type}/${subType}/${file.filename}`
        const newPath = `${config.img.path.all}/${type}/${subType}`
        const savePath = `${type}/${subType}/${file.filename}`
        const exist = await fs.access(newPath)
            .catch(async (err) => {
                if (err.code === 'ENOENT') {
                    const mkdir = await fs.mkdir(newPath, {recursive: true})
                        .catch((err) => { throw err })
                }
            })

        const save = await fs.rename(file.path, newFile)
            .catch((err) => {
                throw err
            })

        // 保存 img
        img.path = savePath
        img.update_at = Date.now()
        img = await img.save().catch(err => { throw err })

        let result = {
            id: img._id,
            compressed: `${config.url.img}/${img.path}`
        }
        res.send(result)
    } catch(e) {
        next(e)
    }
}
const add = async (req, res, next) => {
    try {
        const value = await joi.validate(req.body, schema.img.add)
            .catch((err) => {
                err.msg = 'img数据错误'
                err.code = '406'
                throw err
            })
        const sub = await Sub.findById(value.sub)
            .catch((err) => {
                throw err
            })
        if (!sub || !sub.work) {
            const err = new Error()
            err.msg = '没有找到Sub'
            err.code = 406
            throw err
        }
        // 查找 work
        const work = await Work.findById(sub.work)
            .catch((err) => {
                throw err
            })
        if (!work || !work.subType) {
            const err = new Error()
            err.msg = '没有找到Work'
            err.code = 406
            throw err
        }
        // 查找 type
        const type = await Type.findById(work.subType)
            .catch((err) => {
                throw err
            })
        if (!type) {
            const err = new Error()
            err.msg = '没有找到Type'
            err.code = 406
            throw err
        }
        // 移动新图片
        const file = req.file
        // 'assets/imgs/work/comic/xxxx.jpg'
        // 'assets/imgs/work/comic'
        // 'work/comic/xxxx.jpg'
        const newFile = config.img.path.all + '/' + type.type + '/' + type.subType.name_en + '/' + file.filename
        const newPath = config.img.path.all + '/' + type.type + '/' + type.subType.name_en
        const savePath = type.type + '/' + type.subType.name_en + '/' + file.filename
        const exist = await fs.access(newPath)
            .catch(async (err) => {
                if (err.code === 'ENOENT') {
                    const mkdir = await fs.mkdir(newPath, {recursive: true})
                        .catch((err) => { throw err })
                }
            })

        const save = await fs.rename(file.path, newFile)
            .catch((err) => {
                throw err
            })

        // 保存 img
        let option = {
            path: savePath
        }

        let img = await Img.create(option)
            .catch(err => {
                throw err
            })
        // 更新 sub
        sub.img = img._id
        sub.update_at = Date.now()
        await sub.save().catch((err) => { throw err })
        let result = {
            id: img._id,
            compressed: `${config.url.img}/${img.path}`
        }
        // 返回
        res.send(result)
    } catch (e) {
        next(e)
    }
}

module.exports = {
    adds,
    del,
    add,
    edit
}