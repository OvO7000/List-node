const model = require('./db')

const name = 'Figure'
const schema = {
    name: { type: String, required: true },
    originName: String,
    work: [ Schema.Types.ObjectId ],
    link: [{
        name: { type: String, required: true },
        href: { type: String, required: true },
    }],
    secret: { type: Boolean, default: true }
}

module.exports = model(name, schema)