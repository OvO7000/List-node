const model = require('./db')

const name = 'Img'
const schema = {
  // 相对路径, eg: 'work/film/xxxx.jpg'
  path: {type: String, required: true},
}

module.exports = model(name, schema)