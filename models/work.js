const model = require('./db')
const mongoose = require('mongoose')

const name = 'Work'
const schema = {
  rank: {type: Boolean, default: false},
  subType: {type: mongoose.Schema.ObjectId, required: true},
  adapt: [mongoose.Schema.ObjectId],
  secret: {type: Boolean, default: false}
}

module.exports = model(name, schema)