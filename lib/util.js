/**
 * 发生错误时的返回
 * @param res
 * @param err
 */
const errSend = (res, err) => {
    let result = {}
    if (err instanceof Array) {
        result.status = err[0]
        result.msg = err[1]
    }
    else{
        result.status = 500
        result.msg = err
    }
    res.send(result)
}

/**
 * 成功时的返回
 * @param res
 * @param result
 */
const send = (res, result) => {
    res.status(200).send({
        status: 200,
        data: result
    })
}

/**
 * 输出日志
 * @param data
 */
const log = (message, data) => {
    if (arguments.length = 1) {
        console.error('-------------------------')
        console.error(message)
        console.error('-------------------------')
    } else if (arguments.length = 2) {
        console.error(message, '-------------------------')
        console.error(data)
        console.error('-------------------------')
    }

}

module.exports = {
    errSend,
    send,
    log
}