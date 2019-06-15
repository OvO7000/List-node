const model = require('./db')
const mongoose = require('mongoose')

const name = 'Figure'
const schema = {
    name: { type: String, required: true },
    originName: String,
    work: [ mongoose.Schema.ObjectId ],
    link: [{
        name: { type: String, required: true },
        href: { type: String, required: true },
    }],
    secret: { type: Boolean, default: true }
}

module.exports = model(name, schema)