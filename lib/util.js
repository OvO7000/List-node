const tinify = require('tinify')
const config = require('../config/config')
const fs = require('fs').promises

tinify.key = config.tinify.key

const compress = async (source, destination) => {
  let validate =await tinify.validate()
  console.log('validate', validate)
  let count = tinify.compressionCount
  if (count >= 500) {
    const err = new Error()
    err.msg = '压缩次数超过500次'
    return err
  }

  let image = tinify.fromFile(source)
  return await image.toFile(destination)
}
// const compress = (source, destination) => {
//   return new  Promise((resolve, reject) => {
//     let validate =tinify.validate(function (err) {
//       if (err) { return reject(err) }
//       let count = tinify.compressionCount
//       if (count >= 500) {
//         const err = new Error()
//         err.msg = '压缩次数超过500次'
//         return reject(err)
//       }
//       fs.readFile(source, function(err, sourceData) {
//         if (err) { return reject(err) }
//         tinify.fromBuffer(sourceData).toBuffer(function(err, resultData) {
//           if (err) { return reject(err) }
//           fs.writeFile(destination, resultData, (err) => {
//             if(err){ return reject(err) }
//             resolve()
//           })
//         })
//       })
//     })
//   })
// }

const resize = async (source, destination) => {
  let validate =await tinify.validate()
  console.log('validate', validate)
  let count = tinify.compressionCount
  if (count >= 500) {
    const err = new Error()
    err.msg = '压缩次数超过500次'
    return err
  }

  let image = tinify.fromFile(source)
  let resized = await image.resize({
    method: 'scale',
    width: 220
  })
  return await resized.toFile(destination)
}
// const resize = (source, destination) => {
//   return new Promise((resolve,reject) => {
//     tinify.validate(function (err) {
//       if (err) { return reject(err) }
//       let count = tinify.compressionCount
//       if (count >= 500) {
//         const err = new Error()
//         err.msg = '压缩次数超过500次'
//         reject(err)
//       }
//       let image = tinify.fromFile(source)
//       let resized = image.resize({
//         method: 'scale',
//         width: 220
//       })
//       resized.toFile(destination)
//       resolve()
//     })
//   })
// }

/**
 * 输出日志
 * @param data
 */
function log(message, data) {
  if (arguments.length === 1) {
    console.error('-------------------------')
    console.error(message)
    console.error('-------------------------')
  } else if (arguments.length === 2) {
    console.error(message, '-------------------------')
    console.error(data)
    console.error('-------------------------')
  }

}

module.exports = {
  compress,
  resize,
  log
}