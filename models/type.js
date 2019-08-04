const model = require('./db')

const name = 'Type'
const schema = {
  subType: {
    name: {type: String, required: true},
    name_en: {type: String, required: true}
  },
  type: {type: String, required: true},
  secret: {type: Boolean, default: false}
}

module.exports = model(name, schema)