const model = require('./db')

const name = 'Img'
const schema = {
    origin: { type: String, required: true },
    compressed: { type: String, required: true },
}

module.exports = model(name, schema)