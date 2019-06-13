const model = require('./db')

const name = 'Sub'
const schema = {
    name: { type: String, required: true },
    work: { type: Schema.Types.ObjectId, required: true },
    info: [ {
        name: { type: String, required: true },
        title: { type: String, required: true },
        href: Schema.Types.ObjectId,
    } ],
    // 0: 'alert', 1: 'not perfect complete', 2: 'rotten', 3: 'serials'
    tag: [ Number ],
    img: Schema.Types.ObjectId,
    secret: { type: Boolean, default: true }
}

module.exports = model(name, schema)