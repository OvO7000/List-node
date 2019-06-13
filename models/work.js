const model = require('./db')

const name = 'Work'
const schema = {
    name: { type: String, required: true },
    originName: String,
    rank: { type: Boolean, default: false },
    subType: { type: Schema.Types.ObjectId, required: true },
    adapt: [ Schema.Types.ObjectId ],
    secret: { type: Boolean, default: true }
}

module.exports = model(name, schema)