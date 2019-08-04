const jwt = require('jsonwebtoken')
const redis = require("redis")
// const _ = require("lodash")
const config = require("../config/config")
const client = redis.createClient()

module.exports = function (req, res, next) {
  let token = req.get('Authorization')

  if (token) {
    let payload = jwt.decode(token)
    if (payload.secret) {
      client.get(payload.secret, function (err, secret) {
        // 延期
        if (secret) {
          client.expire(payload.secret, config.expireTime)
        }
        // 验证 token
        try {
          let decoded = jwt.verify(token, secret)
          req.role = decoded
          next()
        } catch (err) {
          next()
        }
      })
    }
  } else {
    next()
  }
}

