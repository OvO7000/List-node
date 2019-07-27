const model = require('./db')

const name = 'User'
const schema = {
    name: { type: String, required: true },
    password: { type: String, required: true },
    // 0: traveler, 1: viewer, 2: admin
    level: { type: Number }
}

module.exports = model(name, schema)