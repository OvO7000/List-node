const model = require('./db')
const mongoose = require('mongoose')

const name = 'Sub'
const schema = {
    name: { type: String, required: true },
    originName: String,
    work: { type: mongoose.Schema.ObjectId, required: true },
    info: [ {
        name: { type: String, required: true },
        title: { type: String, required: true },
        href: mongoose.Schema.ObjectId,
    } ],
    // 0: 'alert', 1: 'not perfect complete', 2: 'rotten', 3: 'serials'
    tag: [ Number ],
    img: mongoose.Schema.ObjectId,
    secret: { type: Boolean, default: false }
}

module.exports = model(name, schema)