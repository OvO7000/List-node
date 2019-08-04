const model = require('./db')
const mongoose = require('mongoose')

const name = 'Figure'
const schema = {
  name: {type: String, required: true},
  originName: String,
  subType: {type: mongoose.Schema.ObjectId, required: true},
  work: [mongoose.Schema.ObjectId],
  link: [{
    _id: false,
    name: {type: String, required: true},
    href: {type: String, required: true},
  }],
  secret: {type: Boolean, default: true}
}

module.exports = model(name, schema)