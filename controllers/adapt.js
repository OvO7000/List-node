const joi = require('@hapi/joi')

const Sub = require('../models/sub')
const Img = require('../models/img')
const Type = require('../models/type')
const Figure = require('../models/figure')
const Adapt = require('../models/adapt')
const Work = require('../models/work')

const util = require('../lib/util')
const schema = require('../lib/schema')
const config = require('../config/config')

const index = async (req, res, next) => {
  try {
    if (!req.role || req.role.level !== 2) {
      const err = new Error()
      err.msg = '没有权限'
      err.code = '406'
      throw err
    }
    // 检查上传数据
    const value = await joi.validate(req.query, schema.figure.query)
      .catch(err => {
        err.msg = '请求数据错误'
        err.code = '406'
        throw err
      })

    let type = await Type.findById(value.subType)
      .catch(err => Promise.reject(err))

    let reg = value.query
    let conditions = {
      $or: [
        {name: {$regex: reg, $options: '$i'}},
        {originName: {$regex: reg, $options: '$i'}}
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
    let figures = await Figure.find(conditions, null, options)
      .catch((err) => {
        throw err
      })

    let figuresPromise = figures.map(async (figure, index) => {
      let item = {
        id: figure._id,
        name: figure.name,
        subType: figure.subType
      }
      figure.originName && (item.originName = figure.originName)
      figure.link && figure.link.length && (item.link = figure.link)
      // 查找 sub
      if (figure.work && figure.work.length > 0) {
        let imgs = []
        let subs = []
        let getSubs = figure.work.map(async (subID, index) => {
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
            return {
              id: sub._id,
              name: sub.name,
              title: subType.subType.name
            }
          }
        })
        subs = await Promise.all(getSubs)
          .catch(err => Promise.reject(err))

        subs && subs.length && (item.work = subs)
        imgs && imgs.length && (item.img = imgs[0])
      }
      return item
    })
    let result = await Promise.all(figuresPromise)
    res.send(result)
  } catch (e) {
    next(e)
  }
}

/**
 * 获取 adapt 列表
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const query = async (req, res, next) => {
  try {
    if (!req.role || req.role.level !== 2) {
      const err = new Error()
      err.msg = '没有权限'
      err.code = '406'
      throw err
    }
    // 检查上传数据
    const value = await joi.validate(req.query, schema.adapt.query)
      .catch(err => {
        err.msg = '请求数据错误'
        err.code = '406'
        throw err
      })

    let reg = value.query
    let conditions = {
      name: {$regex: reg, $options: '$i'},
      is_deleted: false
    }
    let options = {
      sort: {
        update_at: -1
      }
    }
    let adapts = await Adapt.find(conditions, null, options)
      .catch((err) => { throw err })

    let getAdaptsData = adapts.map(async (adapt, index) => {
      let item = {
        id: adapt._id,
        name: adapt.name
      }
      adapt.origin && (item.origin = adapt.origin)
      // 查找 works
      if (adapt.works && adapt.works.length > 0) {
        let getWorks = adapt.works.map(async (workId, index) => {
          let work = await Work.findById(workId)
            .catch(err => Promise.reject(err))
          if (!work || work.is_deleted === true || (work.secret === true && req.role.level < 2)) return
          let item = {
            id: work._id,
            subType: {
              id: work.subType
            }
          }
          let subType = await Type.findById(work.subType)
            .catch(err => Promise.reject(err))
          if (!subType || subType.is_deleted) return
          item.subType.name = subType.subType.name
          item.subType.name_en = subType.subType.name_en
          return item
        })
        let works = await Promise.all(getWorks)
          .catch(err => Promise.reject(err))

        works && works.length && (item.works = works)
      }
      // 查找图片
      if (adapt.origin) {
        let work = await Work.findById(adapt.origin)
          .catch(err => Promise.reject(err))
        if (!work || work.is_deleted) return
        let conditions = {
          work: work._id,
          is_deleted: false,
          img: {
            $exist: true
          }
        }
        let sub = await Sub.findOne(conditions)
          .catch(err => Promise.reject(err))
        if (!sub) return
        let img = await Img.findById(sub.img)
          .catch(err => Promise.reject(err))
        if (!img || img.is_deleted) return
        item.img = `${config.url.img}/${image.path}`
      }
      return item
    })
    let result = await Promise.all(getAdaptsData)
    res.send(result)
  } catch (e) {
    next(e)
  }
}


const exist = async (req, res, next) => {
  try {
    if (!req.role || req.role.level !== 2) {
      const err = new Error()
      err.msg = '没有权限'
      err.code = '406'
      throw err
    }
    // 检查上传数据
    const value = await joi.validate(req.query, schema.adapt.exist)
      .catch(err => {
        err.msg = '请求数据错误'
        err.code = '406'
        throw err
      })

    let conditions = {
      name: value.name,
      is_deleted: false
    }
    let adapt = await Adapt.findOne(conditions)
      .catch((err) => { throw err })
    if (adapt) {
      const err = new Error()
      err.msg = 'adapt 已存在'
      err.code = '406'
      throw err
    } else {
      res.send({ exist: false })
    }
  } catch (e) {
    next(e)
  }
}

module.exports = {
  query,
  exist
}

