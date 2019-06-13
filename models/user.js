const model = require('./db')

const name = 'User'
const schema = {
    name: { type: String, required: true },
    pwd: { type: String, required: true },
    level: { type: Number, default: 0 }
}

module.exports = model(name, schema)