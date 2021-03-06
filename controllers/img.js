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

/**
 * 新增 work 时，添加多个 img
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const adds = async (req, res, next) => {
  try {
    // 检查权限
    if (!req.role || req.role.level !== 2) {
      const err = new Error()
      err.msg = '没有权限'
      err.code = 403
      throw err
    }
    const value = await joi.validate(req.body, schema.img.adds)
      .catch((err) => {
        err.msg = '请求数据错误'
        err.code = 406
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
      const compressFile = config.img.path.work + '/' + type.subType.name_en + '/' + file.filename
      const resizeFile = config.img.path.work + '/' + type.subType.name_en + '/rs' + file.filename
      const newPath = config.img.path.work + '/' + type.subType.name_en
      const compressPath = 'work/' + type.subType.name_en + '/' + file.filename
      const resizePath = 'work/' + type.subType.name_en + '/rs' + file.filename
      const exist = await fs.access(newPath)
        .catch(async (err) => {
          if (err.code === 'ENOENT') {
            const mkdir = await fs.mkdir(newPath, { recursive: true })
              .catch((err) => {
                throw err
              })
          }
        })
      await util.compress(file.path, compressFile)
        .catch((err) => { throw err })
      await util.resize(file.path, resizeFile)
        .catch((err) => { throw err })

      // 保存 img
      let option = {
        path: compressPath,
        resized: resizePath
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
    const deleteUploads = uploads.map(async item => {
      await fs.unlink(config.img.path.upload + item).catch((err) => {
        throw err
      })
    })
    await Promise.all(deleteUploads).catch(err => { throw err })
    res.send(result)

  } catch (e) {
    next(e)
  }

}

/**
 * 删除 img
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const del = async (req, res, next) => {
  try {
    // 检查权限
    if (!req.role || req.role.level !== 2) {
      const err = new Error()
      err.msg = '没有权限'
      err.code = 403
      throw err
    }
    const value = await joi.validate(req.params, schema.img.del)
      .catch((err) => {
        err.msg = 'img数据错误'
        err.code = 406
        throw err
      })
    const conditions = {
      is_deleted: true,
      update_at: Date.now(),
      deleted_at: Date.now()
    }
    let img = await Img.findByIdAndUpdate(value.id, conditions)
      .catch((err) => { throw err })
    let sub = await Sub.findOneAndUpdate({img: value.id}, {$unset: {img: ''}})
      .catch((err) => { throw err })
    await fs.unlink(`${config.img.path.all}/${img.path}`)
      .catch((err) => { console.log(`${config.img.path.all}/${img.path}not exist` ) })
    await fs.unlink(`${config.img.path.all}/${img.resized}`)
      .catch((err) => { console.log(`${config.img.path.all}/${img.path}not exist` ) })

    res.send(img._id)
  } catch (e) {
    next(e)
  }
}

/**
 * 修改 img
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const edit = async (req, res, next) => {
  try {
    // 检查权限
    if (!req.role || req.role.level !== 2) {
      const err = new Error()
      err.msg = '没有权限'
      err.code = 403
      throw err
    }
    req.body.id = req.params.id
    const value = await joi.validate(req.body, schema.img.edit)
      .catch((err) => {
        err.msg = 'img数据错误'
        err.code = 406
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
    // 'assets/imgs/work/comic/rs-xxxx.jpg'
    // 'assets/imgs/work/comic'
    // 'work/comic/xxxx.jpg'
    let type = img.path.split('/')[0]
    let subType = img.path.split('/')[1]
    // const compressed = `${config.img.path.all}/${type}/${subType}/${file.filename}`
    const compressFile = `${config.img.path.all}/${type}/${subType}/${file.filename}`
    const resizeFile = `${config.img.path.all}/${type}/${subType}/rs-${file.filename}`
    const newPath = `${config.img.path.all}/${type}/${subType}`
    const savePath = `${type}/${subType}/${file.filename}`
    const exist = await fs.access(newPath)
      .catch(async (err) => {
        if (err.code === 'ENOENT') {
          const mkdir = await fs.mkdir(newPath, {recursive: true})
            .catch((err) => {
              throw err
            })
        }
      })
    await util.compress(file.path, compressFile)
      .catch((err) => { throw err })    
    await util.resize(file.path, resizeFile)
      .catch((err) => { throw err })

    // const save = await fs.rename(file.path, newFile)
    //   .catch((err) => {
    //     throw err
    //   })

    // 保存 img
    img.path = savePath
    img.update_at = Date.now()
    img = await img.save().catch(err => {
      throw err
    })

    let result = {
      id: img._id,
      path: `${config.url.img}/${img.path}`,
      resized: `${config.url.img}/${img.path}`
    }

    const uploads = await fs.readdir(config.img.path.upload)
      .catch((err) => {
        throw err
      })
    // 删除 uploads 文件夹下图片
    const deleteUploads = uploads.map(async item => {
      await fs.unlink(config.img.path.upload + item).catch((err) => {
        throw err
      })
    })
    await Promise.all(deleteUploads).catch(err => { throw err })

    res.send(result)
  } catch (e) {
    next(e)
  }
}

/**
 * 添加单个 img
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const add = async (req, res, next) => {
  try {
    // 检查权限
    if (!req.role || req.role.level !== 2) {
      const err = new Error()
      err.msg = '没有权限'
      err.code = 403
      throw err
    }
    const value = await joi.validate(req.body, schema.img.add)
      .catch((err) => {
        err.msg = 'img数据错误'
        err.code = 406
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
    // 'assets/imgs/work/comic/rs-xxxx.jpg'
    // 'assets/imgs/work/comic'
    // 'work/comic/xxxx.jpg'
    const compressFile = config.img.path.all + '/' + type.type + '/' + type.subType.name_en + '/' + file.filename
    const resizeFile = config.img.path.all + '/' + type.type + '/' + type.subType.name_en + '/rs-' + file.filename
    const newPath = config.img.path.all + '/' + type.type + '/' + type.subType.name_en
    const compressPath = type.type + '/' + type.subType.name_en + '/' + file.filename
    const resizePath = type.type + '/' + type.subType.name_en + '/rs-' + file.filename
    const exist = await fs.access(newPath)
      .catch(async (err) => {
        if (err.code === 'ENOENT') {
          const mkdir = await fs.mkdir(newPath, {recursive: true})
            .catch((err) => {
              throw err
            })
        }
      })
    await util.compress(file.path, compressFile)
      .catch((err) => { throw err })
    await util.resize(file.path, resizeFile)
      .catch((err) => { throw err })
    // 保存 img
    let option = {
      path: compressPath,
      resized: resizePath
    }

    let img = await Img.create(option)
      .catch(err => { throw err })
    // 更新 sub
    sub.img = img._id
    sub.update_at = Date.now()
    await sub.save().catch((err) => { throw err })
    let result = {
      id: img._id,
      compressed: `${config.url.img}/${img.path}`,
      resized: `${config.url.img}/${img.resized}`
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