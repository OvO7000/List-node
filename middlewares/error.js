/**
 *  异常处理中间件
 * @param err
 * @param req
 * @param res
 * @param next
 */
function errHandler(err, req, res, next) {
  console.error('err middleware-----------------------')
  console.error(err)
  console.error('-----------------------')
  let result = {
    msg: '哪里出了问题...'
  }
  err.msg && (result.msg = err.msg)
  err.code && (typeof(err.code) === 'number') && (result.code = err.code)

  // logger.error(err);
  res.status(result.code || 500).send(result)
  // res.send(err.message);
  next()
}

module.exports = errHandler