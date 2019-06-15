const mongoose = require('mongoose')

const url = 'mongodb://localhost:27017/list'
const config = {
    useNewUrlParser: true
}

mongoose.Promise = global.Promise

mongoose.connect(url, config)
    .then(db => {
        console.log('--------------------------');
        console.log('connect mongodb success');
        console.log('--------------------------');
    })
    .catch(err =>{
        console.log('--------------------------');
        console.log('connect mongodb failed');
        console.log('--------------------------');
    })


function model (name, option, index) {
    // 添加默认字段
    const allOption = {
        created_at: {type: Date, default: Date.now()},
        update_at: {type: Date, default: Date.now()},
        deleted_at: {type: Date, default: Date.now()},
        is_deleted: {type: Boolean, default: false},
        ...option
    }
    const schema = new mongoose.Schema(allOption)

    // 创建索引
    if (index) {
        schema.index(index)
    }

    const model = mongoose.model(name, schema)

    /**
     * 创建文档
     */
    model.create = option =>{
        const document = new model(option)
        return document.save()
    }

    return model
}


module.exports = model