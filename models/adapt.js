const model = require('./db')
const mongoose = require('mongoose')

const name = 'Adapt'
const schema = {
  name: {type: String, required: true},
  origin: mongoose.Schema.ObjectId,
  works: [mongoose.Schema.ObjectId],
}

module.exports = model(name, schema)