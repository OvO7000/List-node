const joi = require('@hapi/joi')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const uuid = require('uuid')
const md5 = require('MD5')
const redis = require("redis")

const User = require('../models/user')

const util = require('../lib/util')
const schema = require('../lib/schema')
const config = require('../config/config')

client = redis.createClient()

/**
 * 添加 user
 * @param name
 * @param password
 * @param level
 * @returns {Promise<T>}
 */
const add = async (name, password, level) => {
  try {
    let hashedPassword = await bcrypt.hash(password, config.saltRounds)
      .catch(err => {
        throw err
      })

    if (!hashedPassword) {
      const err = new Error()
      err.msg = '密码hash失败'
      err.code = '406'
      throw err
    }
    let data = {
      name: name,
      password: hashedPassword,
      level: level
    }
    let user = await User.create(data)
      .catch(err => {
        throw err
      })

    return user
  } catch (e) {
    console.log(e)
  }
}

/**
 * 登录
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const login = async (req, res, next) => {
  try {
    // 检查上传数据
    const value = await joi.validate(req.body, schema.user.login)
      .catch(err => {
        err.msg = '用户信息错误'
        err.code = '406'
        throw err
      })
    // 检查 user 是否存在
    let conditions = {
      name: value.name,
      is_deleted: false
    }
    let user = await User.findOne(conditions)
      .catch(err => Promise.reject(err))
    if (!user || user.is_deleted === true) {
      const err = new Error()
      err.msg = '用户不存在'
      err.code = '406'
      throw err
    }
    // 检查密码是否匹配
    let match = await bcrypt.compare(value.password, user.password)
      .catch(err => Promise.reject(err))
    if (!match) {
      const err = new Error()
      err.msg = '密码错误'
      err.code = '406'
      throw err
    }
    // 生成密钥
    let secret = uuid.v4()
    let md5Secret = md5(secret)
    // 生成token
    let payload = {
      id: user._id,
      secret: md5Secret,
      level: user.level,
    }
    let token = jwt.sign(payload, secret)
    client.set(md5Secret, secret, 'EX', config.expireTime)
    // 返回
    let result = {
      token: token,
      level: user.level
    }
    res.send(result)
  } catch (e) {
    next(e)
  }
}


module.exports = {
  login
}

