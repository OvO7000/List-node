const joi = require('@hapi/joi')
const fs = require('fs').promises

const Sub = require('../models/sub')
const Img = require('../models/img')
const Type = require('../models/type')
const Work = require('../models/work')
const Figure = require('../models/figure')
const Adapt = require('../models/adapt')

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
    // 检查权限
    if (!req.role || req.role.level !== 2) {
      const err = new Error()
      err.msg = '没有权限'
      err.code = 403
      throw err
    }
    // 检查上传数据
    const value = await joi.validate(req.body, schema.sub.add)
      .catch(err => {
        err.msg = 'work数据错误'
        err.code = 406
        throw err
      })
    // 检查 work 是否存在
    let work = await Work.findById(value.work)
      .catch(err => Promise.reject(err))
    if (!work) {
      const err = new Error()
      err.msg = '没有找到work'
      err.code = 406
      throw err
    }
    let conditions = {
      work: work._id,
      is_deleted: false
    }
    let subCount = await Sub.count(conditions)
      .catch((err) => {
        throw err
      })

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
      .catch((err) => {
        throw err
      })

    res.send(sub._id)
  } catch (e) {
    next(e)
  }
}

/**
 * 删除单个或多个 sub
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
    const value = await joi.validate(req.body, schema.sub.del)
      .catch(err => {
        err.msg = '请求数据错误'
        err.code = 406
        throw err
      })

    const delSubs = value.ids.map(async (sub) => {
      const option = {
        is_deleted: true,
        update_at: Date.now(),
        deleted_at: Date.now()
      }
      const result = await Sub.findByIdAndUpdate(sub._id, option)
        .catch((err) => {
          throw err
        })
      // 删除 figure 关联
      if (sub.figure && sub.figure.length) {
        let deleteFigureLink = sub.figure.map(async(figureId, figureIndex) => {
          let figure = Figure.findById(figureId)
            .catch(err => Promise.reject(err))
          if (!figure || figure.is_deleted) {
            return
          }
          if (figure.work) {
            let index = figure.work.indexOf(sub._id)
            figure.work.splice(index, 1)
            figure.update_at = Date.now()
            figure.save()
              .catch(err => Promise.reject(err))
          }
          return figure
        })
        let result = await Promise.all(deleteFigureLink)
          .catch(err => Promise.reject(err))
      }
      // 删除 img
      if (sub.img) {
        let img = await Img.findById(sub.img)
          .catch((err) => {throw err})
        if (result && result.is_deleted === false) {
          await fs.unlink(`${config.img.path.all}/${img.path}`)
            .catch((err) => { throw err })
          await fs.unlink(`${config.img.path.all}/${img.resized}`)
            .catch((err) => { throw err })
          img.is_deleted = true
          img.update_at = Date.now()
          img.deleted_at = Date.now()
          img = await img.save()
            .catch(err => Promise.reject(err))
        }
      }
      return sub.work
    })

    const result = await Promise.all(delSubs)
    let subs = await Sub.find({work: result[0]}, null, {is_deleted: false})
      .catch((err) => {
        throw err
      })
    let work = await Work.findById(result[0])
      .catch((err) => {
        throw err
      })
    if (subs.length === 0) {
      const option = {
        is_deleted: true,
        update_at: Date.now(),
        deleted_at: Date.now()
      }
      const result = await Work.findByIdAndUpdate(result[0], option)
        .catch((err) => {
          throw err
        })
      res.send(result._id)
    }
    let secret = subs.every(item => item.secret === true)
    if (secret !== work.secret) {
      const option = {
        secret: secret,
        update_at: Date.now()
      }
      const result = await Work.findByIdAndUpdate(result[0], option)
        .catch((err) => {
          throw err
        })
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
    if (!req.role || req.role.level !== 2) {
      const err = new Error()
      err.msg = '没有权限'
      err.code = 403
      throw err
    }
    // 检查上传数据
    const value = await joi.validate(req.query, schema.sub.index)
      .catch(err => {
        err.msg = 'work数据错误'
        err.code = 406
        throw err
      })

    let type = await Type.findById(value.subType)
      .catch(err => Promise.reject(err))

    let reg = value.query
    let conditions = {
      $or: [
        {name: {$regex: reg, $options: '$i'}},
        {originName: {$regex: reg, $options: '$i'}},
        {
          info: {
            $elemMatch: {
              name: {$regex: reg, $options: '$i'}
            }
          }
        }
      ],
      subType: value.subType,
      is_deleted: false
    }
    if (!req.role || req.role.level < 1) {
      conditions.secret = false
    }
    let options = {
      sort: {
        update_at: -1
      }
    }
    let subs = await Sub.find(conditions, null, options)
      .catch((err) => {
        throw err
      })

    let subsPromise = subs.map(async (sub, index) => {
      let item = {
        id: sub._id,
        name: sub.name,
        subType: sub.subType
      }
      sub.originName && (item.originName = sub.originName)
      sub.info && sub.info.length && (item.info = sub.info)
      sub.tag && sub.tag.length && (item.tag = sub.tag)
      if (sub.figure && sub.figure.length) {
        let getFigures = sub.figure.map(async(figureId, figureIndex) => {
          // 查找figure
          let figure = await Figure.findById(figureId)
            .catch(err => Promise.reject(err))
          if (!figure || figure.is_deleted) return
          // 查找subType
          let subType = await Type.findById(figure.subType)
            .catch(err => Promise.reject(err))
          if (!subType || subType.is_deleted) return
          return {
            id: figure._id,
            name: figure.name,
            title: subType.subType.name
          }
        })
        sub.figure = await Promise.all(getFigures)
          .catch(err => Promise.reject(err))
      }
      if (sub.img) {
        let image = await Img.findById(sub.img)
          .catch((err) => {
            throw err
          })
        item.img = `${config.url.img}/${image.resized}`
      }
      return item
    })
    let result = await Promise.all(subsPromise)
    res.send(result)
  } catch (e) {
    next(e)
  }
}

/**
 * 根据 sub 的 id 获取单个 work
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
const single = async (req, res, next) => {
  try {
    const value = await joi.validate(req.params, schema.sub.single)
      .catch(err => {
        err.msg = '请求数据错误'
        err.code = 406
        throw err
      })

    const sub = await Sub.findById(value.id)
      .catch(err => Promise.reject(err))
    if (!sub || sub.is_deleted === true) {
      const err = new Error()
      err.msg = '没有找到 work'
      err.code = 406
      throw err
    }
    if (sub.secret === true && req.role.level < 1) {
      const err = new Error()
      err.msg = '没有权限'
      err.code = 403
      throw err
    }
    const work = await Work.findById(sub.work)
      .catch(err => Promise.reject(err))

    if (!work || work.is_deleted === true) {
      const err = new Error()
      err.msg = '没有找到 work'
      err.code = 406
      throw err
    }
    if (work.secret === true && req.role.level < 1) {
      const err = new Error()
      err.msg = '没有权限'
      err.code = 403
      throw err
    }

    // 查找 sub
    let conditions = {
      work: work._id,
      is_deleted: false
    }
    if (!req.role || req.role.level < 1) {
      conditions.secret = false
    }
    let options = {
      sort: {
        sort: 1
      }
    }

    let subs = await Sub.find(conditions, null, options)
      .catch(err => Promise.reject(err))

    if (!subs || subs.length <= 0) {
      const err = new Error()
      err.msg = '没有找到 work'
      err.code = 406
      throw err
    }
    const result = {
      id: work._id,
      rank: work.rank,
      subType: work.subType,
      sub: [],
      imgs: []
    }
    let getSubs = subs.map(async (subItem, subIndex) => {
      let sub = {
        id: subItem._id,
        name: subItem.name,
        secret: subItem.secret,
        sort: subItem.sort
      }
      subItem.originName && (sub.originName = subItem.originName)
      subItem.info && subItem.info.length && (sub.info = subItem.info)
      subItem.tag && subItem.tag.length && (sub.tag = subItem.tag)
      if (subItem.figure && subItem.figure.length) {
        let getFigures = subItem.figure.map(async(figureId, figureIndex) => {
          // 查找figure
          let figure = await Figure.findById(figureId)
            .catch(err => Promise.reject(err))
          if (!figure || figure.is_deleted) return
          // 查找subType
          let subType = await Type.findById(figure.subType)
            .catch(err => Promise.reject(err))
          if (!subType || subType.is_deleted) return
          return {
            id: figure._id,
            name: figure.name,
            title: subType.subType.name
          }
        })
        sub.figure = await Promise.all(getFigures)
          .catch(err => Promise.reject(err))
      }
      return sub
    })
    result.sub = await Promise.all(getSubs)
      .catch(err => Promise.reject(err))
    // 查找图片
    const promises = subs.filter(item => !!item.img).map(async (item, index) => {
      const img = await Img.findById(item.img)
        .catch(err => Promise.reject(err))
      if (img) {
        return {
          id: img._id,
          sub: item._id,
          compressed: config.url.img + '/' + img.path,
          resized: config.url.img + '/' + img.resized,
        }
      }
    })
    const imgs = await Promise.all(promises)
    result.imgs = imgs

    // 查找 adapt
    if (work.adapt) {
      let adapt = await Adapt.findById(work.adapt)
        .catch(err => Promise.reject(err))
      let item = {
        id: adapt._id,
        name: adapt.name
      }
      if (adapt && adapt.works && adapt.is_deleted === false && adapt.works.length > 0) {
          let getWorks = adapt.works.map(async (workId, index) => {
          let workItem = await Work.findById(workId)
            .catch(err => Promise.reject(err))
          if (!workItem || workItem.is_deleted === true || workItem._id.toString() === work._id.toString()) return
          let item = {
            id: workItem._id,
            subType: {
              id: workItem.subType
            }
          }
          let subType = await Type.findById(workItem.subType)
            .catch(err => Promise.reject(err))
          if (!subType || subType.is_deleted) return
          item.subType.name = subType.subType.name
          item.subType.name_en = subType.subType.name_en
          return item
        })
        let worksResult = await Promise.all(getWorks)
          .catch(err => Promise.reject(err))
        worksResult = worksResult.filter(item => item)
        worksResult && worksResult.length && (item.works = worksResult)
        result.adapt = item
      }
    }

    res.send(result)

  } catch (e) {
    next(e)
  }
}

module.exports = {
  add,
  del,
  index,
  single
}

